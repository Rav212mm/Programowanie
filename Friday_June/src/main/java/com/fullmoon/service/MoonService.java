package com.fullmoon.service;

import com.fullmoon.dto.MoonPhaseDTO;
import com.fullmoon.util.MoonCalculator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static com.fullmoon.util.MoonCalculator.Phase;

/**
 * Serwis do obsługi logiki biznesowej związanej z fazami księżyca.
 * Obsługuje 8 faz księżyca, obliczanie wieku, odległości i oświetlenia.
 */
@Service
public class MoonService {

    /**
     * Pobiera listę wszystkich 8 faz księżyca dla danego roku.
     * 
     * @param year rok, dla którego mają być pobrane fazy
     * @return lista zdarzeń księżycowych (wszystkie 8 faz)
     */
    public List<MoonPhaseDTO> getAllPhases(int year) {
        return MoonCalculator.getAllPhases(year).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Pobiera listę kluczowych zdarzeń (tylko nowie i pełnie) dla danego roku.
     * 
     * @param year rok, dla którego mają być pobrane zdarzenia
     * @return lista zdarzeń księżycowych (nowie i pełnie)
     */
    public List<MoonCalculator.LunarEvent> getLunarEvents(int year) {
        return MoonCalculator.getLunarEvents(year);
    }

    /**
     * Pobiera stopień oświetlenia księżyca dla danej daty (0.0 - 1.0).
     * 
     * @param date data, dla której chcemy sprawdzić fazę
     * @return stopień oświetlenia (0 = nów, 1 = pełnia)
     */
    public double getMoonIllumination(LocalDate date) {
        return MoonCalculator.getIllumination(date);
    }

    /**
     * Pobiera aktualną fazę księżyca dla bieżącej daty.
     * 
     * @return DTO z aktualną fazą księżyca
     */
    public MoonPhaseDTO getCurrentPhase() {
        return getPhaseForDate(LocalDate.now());
    }

    /**
     * Pobiera fazę księżyca dla danej daty.
     * 
     * @param date data, dla której chcemy sprawdzić fazę
     * @return DTO z informacjami o fazie
     */
    public MoonPhaseDTO getPhaseForDate(LocalDate date) {
        double moonAge = MoonCalculator.getMoonAge(date);
        double cyclePosition = moonAge / MoonCalculator.SYNODIC_MONTH_DAYS;
        Phase phase = MoonCalculator.getPhase(cyclePosition);
        double illumination = MoonCalculator.getIllumination(date);
        double distance = MoonCalculator.getMoonDistance(date);

        return new MoonPhaseDTO(
                date,
                phase.getPolishName(),
                illumination,
                MoonPhaseDTO.PhaseType.valueOf(phase.name()),
                (int) moonAge,
                distance
        );
    }

    /**
     * Oblicza dni do następnej pełni księżyca.
     * 
     * @param startDate data początkowa
     * @return liczba dni do następnej pełni
     */
    public int daysUntilFullMoon(LocalDate startDate) {
        LocalDate current = startDate;
        while (current.isBefore(startDate.plusYears(1))) {
            double illumination = MoonCalculator.getIllumination(current);
            if (illumination > 0.95 && !current.isEqual(startDate)) {
                return (int) java.time.Duration.between(
                        startDate.atStartOfDay(), current.atStartOfDay()).toDays();
            }
            current = current.plusDays(1);
        }
        return -1; // nie znaleziono pełni w ciągu roku
    }

    /**
     * Oblicza dni do następnego nowiu księżyca.
     * 
     * @param startDate data początkowa
     * @return liczba dni do następnego nowiu
     */
    public int daysUntilNewMoon(LocalDate startDate) {
        LocalDate current = startDate;
        while (current.isBefore(startDate.plusYears(1))) {
            double illumination = MoonCalculator.getIllumination(current);
            if (illumination < 0.05 && !current.isEqual(startDate)) {
                return (int) java.time.Duration.between(
                        startDate.atStartOfDay(), current.atStartOfDay()).toDays();
            }
            current = current.plusDays(1);
        }
        return -1; // nie znaleziono nowiu w ciągu roku
    }

    /**
     * Konwertuje MoonEvent na MoonPhaseDTO.
     */
    private MoonPhaseDTO toDTO(MoonCalculator.MoonEvent event) {
        double moonAge = MoonCalculator.getMoonAge(event.date());
        double illumination = MoonCalculator.getIllumination(event.date());
        double distance = MoonCalculator.getMoonDistance(event.date());

        return new MoonPhaseDTO(
                event.date(),
                event.phase().getPolishName(),
                illumination,
                MoonPhaseDTO.PhaseType.valueOf(event.phase().name()),
                (int) moonAge,
                distance
        );
    }
}
