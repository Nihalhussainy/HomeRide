
package com.homeride.backend.service;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import com.homeride.backend.dto.LoginRequestDTO;
import com.homeride.backend.dto.RegisterRequestDTO;
import com.homeride.backend.model.Employee;
import com.homeride.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.homeride.backend.dto.AdminUserUpdateDTO;
import java.security.Principal;

import java.util.ArrayList;

@Service
public class EmployeeService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;

    }
    // Add this method inside your EmployeeService class
    public Employee findEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
    // THIS METHOD WAS LIKELY MISSING
    public Employee registerEmployee(RegisterRequestDTO registerRequest) {
        Employee newEmployee = new Employee();
        newEmployee.setName(registerRequest.getName());
        newEmployee.setEmail(registerRequest.getEmail());
        newEmployee.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newEmployee.setRole("EMPLOYEE");
        newEmployee.setTravelCredit(1000.0);
        return employeeRepository.save(newEmployee);
    }

    // THIS METHOD WAS LIKELY MISSING
    public Employee loginEmployee(LoginRequestDTO loginRequest) {
        Employee employee = employeeRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), employee.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return employee;
    }

    // This is the method for Spring Security
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // This now includes the user's role for Spring Security
        return new User(employee.getEmail(), employee.getPassword(), Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + employee.getRole())));
    }
    public Employee updateUserAsAdmin(Long userId, AdminUserUpdateDTO updateRequest) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + userId));

        // Update fields only if they are provided in the request
        if (updateRequest.getRole() != null) {
            employee.setRole(updateRequest.getRole());
        }
        if (updateRequest.getTravelCredit() != null) {
            employee.setTravelCredit(updateRequest.getTravelCredit());
        }

        return employeeRepository.save(employee);
    }

}