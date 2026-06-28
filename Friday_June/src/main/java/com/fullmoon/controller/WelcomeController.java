package com.fullmoon.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Kontroler obsługujący stronę główną aplikacji.
 */
@Controller
public class WelcomeController {
    
    /**
     * Zwraca stronę główną aplikacji.
     * 
     * @return nazwa szablonu HTML
     */
    @GetMapping("/")
    public String welcome() {
        return "welcome";
    }
}