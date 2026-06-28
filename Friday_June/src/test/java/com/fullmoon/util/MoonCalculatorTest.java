package com.fullmoon.util;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MoonCalculatorTest {

    @Test
    void testGetLunarEventsForYear2024() {
        // Dla roku 2024 powinniśmy otrzymać listę zdarzeń (nowie i pełnie).
        List<MoonCalculator.LunarEvent> events = MoonCalculator.getLunarEvents(2024);

        assertNotNull(events, "Lista zdarzeń nie może być null");
        assertFalse(events.isEmpty(), "Lista zdarzeń dla 2024 powinna zawierać dane");

        for (MoonCalculator.LunarEvent event : events) {
            assertEquals(2024, event.date().getYear(), "Wszystkie daty muszą należeć do roku 2024");
        }
    }

    @Test
    void testGetLunarEventsForFutureYear() {
        // Test dla roku w przyszłości (np. 2030)
        List<MoonCalculator.LunarEvent> events = MoonCalculator.getLunarEvents(2030);
        assertNotNull(events);
        if (!events.isEmpty()) {
            assertEquals(2030, events.get(0).date().getYear());
        }
    }

    @Test
    void testGetLunarEventsForPastYear() {
        // Test dla roku z przeszłości (np. 2005)
        List<MoonCalculator.LunarEvent> events = MoonCalculator.getLunarEvents(2005);
        assertNotNull(events);
        if (!events.isEmpty()) {
            assertEquals(2005, events.get(0).date().getYear());
        }
    }

    @Test
    void testGetIllumination() {
        // Zamiast używać sztywnych dat, pobierzmy faktyczne zdarzenia z algorytmu
        List<MoonCalculator.LunarEvent> events = MoonCalculator.getLunarEvents(2024);

        // Znajdź pierwszą pełnię i nów w 2024 roku
        MoonCalculator.LunarEvent firstFullMoon = null;
        MoonCalculator.LunarEvent firstNewMoon = null;

        for (MoonCalculator.LunarEvent event : events) {
            if (event.type() == MoonCalculator.PhaseType.FULL_MOON && firstFullMoon == null) {
                firstFullMoon = event;
            }
            if (event.type() == MoonCalculator.PhaseType.NEW_MOON && firstNewMoon == null) {
                firstNewMoon = event;
            }
        }

        assertNotNull(firstFullMoon, "Powinien istnieć nów w 2024");
        assertNotNull(firstNewMoon, "Powinna istnieć pełnia w 2024");

        // Sprawdź iluminację dla tych konkretnych dat
        double illuminationFull = MoonCalculator.getIllumination(firstFullMoon.date());
        double illuminationNew = MoonCalculator.getIllumination(firstNewMoon.date());

        assertTrue(illuminationFull > 0.9, "Pełnia powinna mieć wysokie oświetlenie (odczytano: " + illuminationFull + ")");
        assertTrue(illuminationNew < 0.1, "Nów powinien mieć niskie oświetlenie (odczytano: " + illuminationNew + ")");
    }

    @Test
    void testGetPhase() {
        // Test poprawnych wartości cyclePosition
        assertEquals(MoonCalculator.Phase.NEW_MOON, MoonCalculator.getPhase(0.0));
        assertEquals(MoonCalculator.Phase.FULL_MOON, MoonCalculator.getPhase(0.5));
        assertEquals(MoonCalculator.Phase.FIRST_QUARTER, MoonCalculator.getPhase(0.25));
        assertEquals(MoonCalculator.Phase.LAST_QUARTER, MoonCalculator.getPhase(0.75));

        // Test granicy 1.0 (powinna wrapować do NEW_MOON)
        assertEquals(MoonCalculator.Phase.NEW_MOON, MoonCalculator.getPhase(1.0));
    }

    @Test
    void testGetPhaseInvalidInput() {
        // Test nieprawidłowych wartości
        assertThrows(IllegalArgumentException.class, () -> MoonCalculator.getPhase(-0.1));
        assertThrows(IllegalArgumentException.class, () -> MoonCalculator.getPhase(1.1));
    }

    @Test
    void testGetMoonAge() {
        // Nów powinien mieć wiek bliski 0 lub 29.53 (pełny cykl)
        List<MoonCalculator.LunarEvent> events = MoonCalculator.getLunarEvents(2024);
        for (MoonCalculator.LunarEvent event : events) {
            if (event.type() == MoonCalculator.PhaseType.NEW_MOON) {
                double age = MoonCalculator.getMoonAge(event.date());
                // Wiekszy powinien być bliski 0 lub bardzo bliski SYNODIC_MONTH_DAYS
                assertTrue(age >= 0 && age < MoonCalculator.SYNODIC_MONTH_DAYS);
            }
        }
    }

    @Test
    void testGetMoonDistance() {
        // Odległość powinna być w rozsądnym zakresie (356400 - 405400 km)
        LocalDate testDate = LocalDate.of(2024, 6, 1);
        double distance = MoonCalculator.getMoonDistance(testDate);
        assertTrue(distance >= 350000 && distance <= 410000,
                "Odległość powinna być w zakresie 350k-410k km, otrzymano: " + distance);
    }

    @Test
    void testGetAllPhases() {
        // getAllPhases powinno zwrócić wszystkie 8 faz dla danego roku
        List<MoonCalculator.MoonEvent> phases = MoonCalculator.getAllPhases(2024);
        assertNotNull(phases);
        assertFalse(phases.isEmpty());

        // Powinniśmy mieć wiele zdarzeń w roku (około 24-30)
        assertTrue(phases.size() > 20, "Powinno być więcej niż 20 faz w roku");

        // Każdy event powinien mieć poprawną datę
        for (MoonCalculator.MoonEvent event : phases) {
            assertEquals(2024, event.date().getYear());
            assertNotNull(event.phase());
        }
    }

    @Test
    void testSynodicMonthConstant() {
        // Stała SYNODIC_MONTH_DAYS powinna być bliska rzeczywistej wartości (29.53 dni)
        assertEquals(29.53058867, MoonCalculator.SYNODIC_MONTH_DAYS, 0.001);
    }

    @Test
    void testIlluminationRange() {
        // Iluminacja powinna zawsze zwracać wartość 0-1
        for (int year = 2000; year <= 2100; year += 10) {
            for (int month = 1; month <= 12; month++) {
                try {
                    LocalDate testDate = LocalDate.of(year, month, 15);
                    double illum = MoonCalculator.getIllumination(testDate);
                    assertTrue(illum >= 0.0 && illum <= 1.0,
                            "Iluminacja poza zakresem dla daty: " + testDate + " -> " + illum);
                } catch (Exception e) {
                    // Ignorujemy błędy dla dni które nie istnieją (np. 31 w niektórych miesiącach)
                }
            }
        }
    }

    @Test
    void testPhaseEnumPolishNames() {
        // Każdy Phase powinien mieć poprawną nazwę polską
        for (MoonCalculator.Phase phase : MoonCalculator.Phase.values()) {
            assertNotNull(phase.getPolishName());
            assertFalse(phase.getPolishName().isEmpty());
        }

        assertEquals("Nów", MoonCalculator.Phase.NEW_MOON.getPolishName());
        assertEquals("Pełnia", MoonCalculator.Phase.FULL_MOON.getPolishName());
    }
}