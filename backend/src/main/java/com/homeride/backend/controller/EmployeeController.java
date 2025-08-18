package com.homeride.backend.controller;

import com.homeride.backend.model.Employee;
import com.homeride.backend.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    public ResponseEntity<Employee> getCurrentUser(Principal principal) {
        Employee employee = employeeService.findEmployeeByEmail(principal.getName());
        return ResponseEntity.ok(employee);
    }
}