# LaraPee – Full Stack POS & Web Application Platform

LaraPee is a full-stack web application platform built with Laravel, React (Inertia.js), Docker, and PostgreSQL/MySQL.  
It is designed using production-level architecture principles to demonstrate scalable backend design, modern frontend integration, and containerized development environments.

This project reflects real-world backend and full-stack engineering practices.

---

## Overview

LaraPee provides a structured backend system and web interface foundation for building POS systems, dashboards, or business management applications.

It uses Laravel as the core backend framework, React with Inertia.js for the frontend, and Docker for environment consistency and deployment readiness.

The architecture is designed to support both web applications and future mobile integration via REST API.

---

## Tech Stack

### Backend
- Laravel 12
- PHP 8+
- REST API ready architecture
- Service layer architecture

### Frontend
- React
- Inertia.js
- Modern JavaScript (ES6+)

### Database
- PostgreSQL
- MySQL compatible

### DevOps
- Docker
- Docker Compose
- Nginx
- RabbitMQ
- Git

---

## Features

- Full stack Laravel + React architecture
- Inertia.js integration for modern frontend routing
- REST API ready for mobile applications
- Docker containerized development environment
- Clean service-based backend architecture
- Scalable and maintainable project structure

---

## Development Environment

This project uses Docker to ensure consistent development and deployment environments.

Services include:

- PHP (Laravel)
- Nginx
- MySQL
- RabbitMQ (queue broker)

---

## Purpose

This project was built to demonstrate my ability to:

- Design scalable backend systems using Laravel
- Integrate modern frontend technologies (React + Inertia)
- Use Docker for professional development environments
- Structure full-stack applications using clean architecture principles

It represents production-oriented engineering practices rather than tutorial-based development.

---

## Future Enhancements

- React Native mobile application integration
- Authentication system using Laravel Sanctum
- Full POS feature implementation
- API expansion for external integrations

---

## Queue (RabbitMQ)

RabbitMQ is used as the default queue backend.

1. Ensure RabbitMQ is running (`docker compose up -d rabbitmq`).
2. Use `QUEUE_CONNECTION=rabbitmq` in `.env`.
3. Start app with worker:
   - `composer dev`
   - or run worker manually: `php artisan queue:work rabbitmq --queue=default --tries=3 --timeout=90`

RabbitMQ management UI:
- `http://localhost:15672`
- username: `guest`
- password: `guest`
