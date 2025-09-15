package com.homeride.backend.controller;

import com.homeride.backend.dto.ChatMessageDTO;
import com.homeride.backend.model.ChatMessage;
import com.homeride.backend.model.Employee;
import com.homeride.backend.repository.ChatMessageRepository;
import com.homeride.backend.repository.EmployeeRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final EmployeeRepository employeeRepository; // NEW

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository, EmployeeRepository employeeRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.employeeRepository = employeeRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO) {
        // Look up the sender's details from the database
        Employee sender = employeeRepository.findByEmail(chatMessageDTO.getSenderEmail())
                .orElseThrow(() -> new RuntimeException("Sender not found for chat message"));

        // Convert the DTO to a JPA entity
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSenderName(sender.getName()); // Use retrieved name
        chatMessage.setSenderEmail(sender.getEmail());
        chatMessage.setSenderProfilePictureUrl(sender.getProfilePictureUrl()); // Set the profile picture URL
        chatMessage.setContent(chatMessageDTO.getContent());
        chatMessage.setRideId(chatMessageDTO.getRideId());
        chatMessage.setType(chatMessageDTO.getType());
        chatMessage.setTimestamp(LocalDateTime.now());

        // Save message to database
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // Broadcast the saved message to the ride's group topic
        messagingTemplate.convertAndSend("/topic/ride." + savedMessage.getRideId(), savedMessage);
    }
}