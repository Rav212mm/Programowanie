package com.fullmoon.controller;

import com.fullmoon.dto.MoonPhaseDTO;
import com.fullmoon.service.MoonService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static com.fullmoon.util.MoonCalculator.SYNODIC_MONTH_DAYS;

/**
 * RestController dla potrzeb API (wywoływane przez JavaScript).
 * Udostępnia endpointy do pobierania faz księżyca, oświetlenia i informacji.
 */
@RestController
public class MoonApiController {
    
    private final MoonService moonService;

    public MoonApiController(MoonService moonService) {
        this.moonService = moonService;
    }

    /**
     * Zwraca stopień oświetlenia księżyca dla danej daty w formacie JSON.
     */
    @GetMapping("/api/illumination")
    public Map<String, Double> getIllumination(@RequestParam String date) {
        double illumination = moonService.getMoonIllumination(LocalDate.parse(date));
        return Map.of("illumination", illumination);
    }

    /**
     * Zwraca aktualną fazę księżyca.
     */
    @GetMapping("/api/phases/current")
    public MoonPhaseDTO getCurrentPhase() {
        return moonService.getCurrentPhase();
    }

    /**
     * Zwraca fazę księżyca dla danej daty.
     */
    @GetMapping("/api/phases/{date}")
    public MoonPhaseDTO getPhaseForDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String date) {
        return moonService.getPhaseForDate(LocalDate.parse(date));
    }

    /**
     * Zwraca wszystkie fazy księżyca dla danego roku.
     */
    @GetMapping("/api/phases/year/{year}")
    public List<MoonPhaseDTO> getPhasesForYear(@PathVariable int year) {
        return moonService.getAllPhases(year);
    }

    /**
     * Zwraca wszystkie fazy księżyca dla danego miesiąca.
     */
    @GetMapping("/api/phases/month/{year}/{month}")
    public List<MoonPhaseDTO> getPhasesForMonth(@PathVariable int year, @PathVariable int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        return moonService.getAllPhases(year).stream()
                .filter(dto -> !dto.date().isBefore(startOfMonth) && !dto.date().isAfter(endOfMonth))
                .toList();
    }

    /**
     * Zwraca informacje o księżycu: wiek, odległość, oświetlenie, fazę.
     */
    @GetMapping("/api/moon-info")
    public Map<String, Object> getMoonInfo(@RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        MoonPhaseDTO phase = moonService.getPhaseForDate(targetDate);

        int daysToFullMoon = moonService.daysUntilFullMoon(targetDate);
        int daysToNewMoon = moonService.daysUntilNewMoon(targetDate);

        return Map.of(
                "phase", phase,
                "daysToFullMoon", daysToFullMoon >= 0 ? daysToFullMoon : -1,
                "daysToNewMoon", daysToNewMoon >= 0 ? daysToNewMoon : -1,
                "moonAgeDays", Math.round(phase.moonAge() * 10.0) / 10.0,
                "cycleProgress", Math.round((phase.moonAge() / SYNODIC_MONTH_DAYS) * 100.0) / 100.0
        );
    }

    /**
     * Zwraca nadchodzące kluczowe wydarzenia (supernowie, pełnie).
     */
    @GetMapping("/api/events/upcoming")
    public List<MoonPhaseDTO> getUpcomingEvents(@RequestParam(defaultValue = "5") int limit) {
        return moonService.getAllPhases(LocalDate.now().getYear()).stream()
                .filter(dto -> !dto.date().isBefore(LocalDate.now()))
                .limit(limit)
                .toList();
    }
}
