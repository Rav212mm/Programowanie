package com.fullmoon.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Kalkulator faz księżyca oparty na algorytmie astronomicznym.
 * Oblicza nowie, pełnie oraz wszystkie 8 faz księżyca.
 */
public class MoonCalculator {

    // === Stałe konfiguracyjne ===
    public static final double SYNODIC_MONTH_DAYS = 29.53058867;
    public static final long NEW_MOON_EPOCH_MS = 947184840000L; // 2000-01-06T18:14:00Z

    // --- Miesiąc anomalistyczny (perygeum -> perygeum) ---
    // Cykl odległości jest niezależny od cyklu faz (synodycznego), dlatego liczymy go osobno.
    public static final double ANOMALISTIC_MONTH_DAYS = 27.55454988;
    // Epoka przejścia przez perygeum wyprowadzona z elementów średnich Meeusa:
    // w J2000 (2000-01-01 12:00 TT) anomalia średnia Księżyca M0 = 134.9634°,
    // a perygeum (M = 360°) następuje 17.224 dnia później ~ 2000-01-18 21:36 UTC.
    public static final long PERIGEE_EPOCH_MS = 948216179520L;

    // --- Parametry orbity Księżyca ---
    public static final double MEAN_DISTANCE_KM = 384400.0; // półoś wielka
    public static final double ECCENTRICITY = 0.0549;        // mimośród orbity
    public static final double PERIGEE_KM = MEAN_DISTANCE_KM * (1 - ECCENTRICITY); // ~363,296 km
    public static final double APOGEE_KM  = MEAN_DISTANCE_KM * (1 + ECCENTRICITY); // ~405,504 km

    /**
     * Określa fazę księżyca na podstawie pozycji w cyklu synodycznym (0.0 - 1.0).
     */
    public static Phase getPhase(double cyclePosition) {
        // cyclePosition: 0.0 - 1.0 reprezentuje pełny cykl
        if (cyclePosition < 0 || cyclePosition > 1) {
            throw new IllegalArgumentException("cyclePosition must być między 0.0 a 1.0");
        }

        return switch ((int) (cyclePosition * 8)) {
            case 0 -> Phase.NEW_MOON;
            case 1 -> Phase.WAXING_CRESCENT;
            case 2 -> Phase.FIRST_QUARTER;
            case 3 -> Phase.WAXING_GIBBOUS;
            case 4 -> Phase.FULL_MOON;
            case 5 -> Phase.WANING_GIBBOUS;
            case 6 -> Phase.LAST_QUARTER;
            case 7 -> Phase.WANING_CRESCENT;
            default -> Phase.NEW_MOON; // 1.0 wrapuje do 0
        };
    }

    /**
     * Oblicza wiek księżyca w dniach dla danej daty.
     */
    public static double getMoonAge(LocalDate date) {
        long targetMs = date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
        double daysSinceNewMoon = (targetMs - NEW_MOON_EPOCH_MS) / (24 * 60 * 60 * 1000.0);
        double cyclePosition = daysSinceNewMoon % SYNODIC_MONTH_DAYS;
        if (cyclePosition < 0) cyclePosition += SYNODIC_MONTH_DAYS;
        return cyclePosition;
    }

    /**
     * Oblicza stopień oświetlenia księżyca (0.0 - 1.0) dla danej daty.
     * 0.0 = Nów, 1.0 = Pełnia.
     */
    public static double getIllumination(LocalDate date) {
        long targetMs = date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
        double daysSinceNewMoon = (targetMs - NEW_MOON_EPOCH_MS) / (24 * 60 * 60 * 1000.0);
        double cyclePosition = daysSinceNewMoon % SYNODIC_MONTH_DAYS;
        if (cyclePosition < 0) cyclePosition += SYNODIC_MONTH_DAYS;

        // Kąt fazowy: 0 w nowiu, PI w pełni, 2*PI z powrotem w nowiu.
        double phaseAngle = 2 * Math.PI * (cyclePosition / SYNODIC_MONTH_DAYS);

        // Oświetlona część widocznej tarczy Księżyca: k = (1 - cos(kąt)) / 2.
        // Daje 0 w nowiu, 0.5 w kwadrach i 1.0 w pełni (poprawna krzywizna).
        return (1 - Math.cos(phaseAngle)) / 2.0;
    }

    /**
     * Oblicza przybliżoną odległość księżyca od Ziemi w km.
     */
    public static double getMoonDistance(LocalDate date) {
        long targetMs = date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
        double daysSincePerigee = (targetMs - PERIGEE_EPOCH_MS) / (24 * 60 * 60 * 1000.0);

        // Anomalia średnia M (0 w perygeum) - cykl odległości jest niezależny od faz.
        double meanAnomaly = 2 * Math.PI * (daysSincePerigee / ANOMALISTIC_MONTH_DAYS);

        // Odległość z równania orbity Keplera (przybliżenie do drugiego rzędu mimośrodu):
        // r ≈ a * (1 - e*cos M). Minimum (perygeum) przy M = 0, maksimum (apogeum) przy M = PI.
        return MEAN_DISTANCE_KM * (1 - ECCENTRICITY * Math.cos(meanAnomaly));
    }

    /**
     * Pobiera listę wszystkich faz księżyca dla danego roku.
     * Zwraca wszystkie 8 faz w kolejności chronologicznej.
     */
    public static List<MoonEvent> getAllPhases(int year) {
        List<MoonEvent> events = new ArrayList<>();
        long startOfYearMs = LocalDate.of(year, 1, 1).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();

        // Obliczamy cykl początkowy
        double cyclesSinceEpoch = (startOfYearMs - NEW_MOON_EPOCH_MS) / (SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000.0);

        // Szukamy cykli na zakres ~2 miesięcy przed i po roku, aby mieć pełną listę
        int startCycle = (int) Math.floor(cyclesSinceEpoch - 2);
        int endCycle = (int) Math.ceil(cyclesSinceEpoch + 26); // ~22 miesiące

        for (int cycle = startCycle; cycle <= endCycle; cycle++) {
            // Generujemy wszystkie 8 faz dla danego cyklu
            for (int phaseOffset = 0; phaseOffset < 8; phaseOffset++) {
                double fraction = phaseOffset / 8.0;
                long eventMs = NEW_MOON_EPOCH_MS + (long)((cycle + fraction) * SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000.0);
                LocalDate eventDate = Instant.ofEpochMilli(eventMs).atZone(ZoneOffset.UTC).toLocalDate();

                if (eventDate.getYear() == year) {
                    Phase phase = getPhase(fraction);
                    double moonAge = cycle + fraction;
                    events.add(new MoonEvent(eventDate, phase));
                }
            }
        }

        events.sort(Comparator.comparing(MoonEvent::date).thenComparing(MoonEvent::phase));
        return events;
    }

    /**
     * Pobiera listę kluczowych zdarzeń (tylko nowie i pełnie) dla danego roku.
     */
    public static List<LunarEvent> getLunarEvents(int year) {
        List<LunarEvent> events = new ArrayList<>();
        long startOfYearMs = LocalDate.of(year, 1, 1).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
        double cyclesSinceEpoch = (startOfYearMs - NEW_MOON_EPOCH_MS) / (SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000.0);

        // Szukamy zdarzeń w zakresie +/- 1 roku od początku/końca, aby mieć pełną listę dla danego roku
        for (int i = -15; i < 30; i++) {
            double cycleOffset = Math.floor(cyclesSinceEpoch) + i;

            // Nowie
            long newMoonMs = NEW_MOON_EPOCH_MS + (long)(cycleOffset * SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000.0);
            LocalDate newMoonDate = Instant.ofEpochMilli(newMoonMs).atZone(ZoneOffset.UTC).toLocalDate();
            if (newMoonDate.getYear() == year) {
                events.add(new LunarEvent(newMoonDate, PhaseType.NEW_MOON));
            }

            // Pełnie (~0.5 cyklu później)
            long fullMoonMs = NEW_MOON_EPOCH_MS + (long)((cycleOffset + 0.5) * SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000.0);
            LocalDate fullMoonDate = Instant.ofEpochMilli(fullMoonMs).atZone(ZoneOffset.UTC).toLocalDate();
            if (fullMoonDate.getYear() == year) {
                events.add(new LunarEvent(fullMoonDate, PhaseType.FULL_MOON));
            }
        }

        events.sort(Comparator.comparing(LunarEvent::date));
        return events;
    }

    // === Enumy i rekordy ===

    public enum Phase {
        NEW_MOON("Nów"),
        WAXING_CRESCENT("Rośnący sierp"),
        FIRST_QUARTER("Pierwsza kwadra"),
        WAXING_GIBBOUS("Rośnący garbaty"),
        FULL_MOON("Pełnia"),
        WANING_GIBBOUS("Malejący garbaty"),
        LAST_QUARTER("Ostatnia kwadra"),
        WANING_CRESCENT("Malejący sierp");

        private final String polishName;

        Phase(String polishName) {
            this.polishName = polishName;
        }

        public String getPolishName() {
            return polishName;
        }
    }

    public enum PhaseType {
        NEW_MOON, FULL_MOON
    }

    /**
     * Rekord reprezentujący kluczowe zdarzenie (tylko nów lub pełnia).
     */
    public record LunarEvent(LocalDate date, PhaseType type) {}

    /**
     * Rekord reprezentujący dowolną fazę księżyca.
     */
    public record MoonEvent(LocalDate date, Phase phase) {}
}
