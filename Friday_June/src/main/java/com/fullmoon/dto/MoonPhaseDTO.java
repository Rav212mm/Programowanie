package com.fullmoon.dto;

import java.time.LocalDate;

/**
 * DTO reprezentujące pojedynczą fazę księżyca.
 */
public record MoonPhaseDTO(
        LocalDate date,
        String phaseName,
        double illumination,
        PhaseType type,
        int moonAge,
        double distanceKm
) {
    public enum PhaseType {
        NEW_MOON("Nów"),
        WAXING_CRESCENT("Rośnący sierp"),
        FIRST_QUARTER("Pierwsza kwadra"),
        WAXING_GIBBOUS("Rośnący garbaty"),
        FULL_MOON("Pełnia"),
        WANING_GIBBOUS("Malejący garbaty"),
        LAST_QUARTER("Ostatnia kwadra"),
        WANING_CRESCENT("Malejący sierp");

        private final String polishName;

        PhaseType(String polishName) {
            this.polishName = polishName;
        }

        public String getPolishName() {
            return polishName;
        }
    }
}