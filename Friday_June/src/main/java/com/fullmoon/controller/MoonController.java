package com.fullmoon.controller;

import com.fullmoon.dto.MoonPhaseDTO;
import com.fullmoon.service.MoonService;
import com.fullmoon.util.MoonCalculator;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

/**
 * Kontroler obsługujący żądania HTTP związane z fazami księżyca.
 */
@Controller
public class MoonController {
    
    private final MoonService moonService;

    public MoonController(MoonService moonService) {
        this.moonService = moonService;
    }

    /**
     * Wyświetla stronę z listą zdarzeń księżycowych (nowie i pełnie).
     * 
     * @param year rok, dla którego mają być wyświetlone zdarzenia (domyślnie bieżący)
     * @param model model Thymeleaf do przekazywania danych do widoku
     * @return nazwa szablonu HTML
     */
    @GetMapping("/fullmoons")
    public String showLunarEvents(@RequestParam(defaultValue = "2024") int year, Model model) {
        List<MoonCalculator.LunarEvent> events = moonService.getLunarEvents(year);
        List<MoonPhaseDTO> allPhases = moonService.getAllPhases(year);
        model.addAttribute("year", year);
        model.addAttribute("events", events);
        model.addAttribute("allPhases", allPhases);
        return "fullmoons";
    }

    /**
     * Zwraca fazy księżyca dla danego miesiąca w formacie JSON (API AJAX).
     */
    @GetMapping("/api/calendar/month")
    public List<MoonPhaseDTO> getMonthPhases(@RequestParam int year, @RequestParam int month) {
        return moonService.getAllPhases(year).stream()
                .filter(dto -> dto.date().getYear() == year && dto.date().getMonthValue() == month)
                .toList();
    }
}