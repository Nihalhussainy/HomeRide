package com.homeride.backend.controller;

import com.homeride.backend.service.GooglePlacesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class GooglePlacesController {

    private final GooglePlacesService googlePlacesService;

    @Autowired
    public GooglePlacesController(GooglePlacesService googlePlacesService) {
        this.googlePlacesService = googlePlacesService;
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> getAutocompleteSuggestions(@RequestParam String query) {
        List<String> suggestions = googlePlacesService.getAutocompleteSuggestions(query);
        return ResponseEntity.ok(suggestions);
    }
}