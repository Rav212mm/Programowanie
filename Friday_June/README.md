# Full Moon Web App 🌕

Nowoczesna aplikacja webowa napisana w **Spring Boot**, prezentująca fazy księżyca
w interaktywnym, „kosmicznym" interfejsie. Wszystkie dane liczone są lokalnie na
podstawie algorytmu astronomicznego opartego na cyklu synodycznym — bez zewnętrznych API.

## ✨ Funkcje
- **Strona główna (`/`)** – aktualna faza księżyca z animowaną wizualizacją SVG, oświetleniem,
  wiekiem księżyca, odległością od Ziemi i odliczaniem do najbliższej pełni / nowiu.
- **Kalendarz (`/fullmoons`)** – interaktywny kalendarz miesięczny z mini-ikonami faz dla każdego dnia,
  panelem szczegółów po kliknięciu w dzień oraz listą kluczowych wydarzeń (pełnie i nowie) w roku.
- Nowoczesny, responsywny UI: ciemny motyw, animowane gwiazdy w tle, efekty glassmorphism,
  płynne animacje wejścia.
- Obliczanie wszystkich **8 faz** księżyca dla dowolnego roku.

## 🛠️ Technologie
- **Java 17**
- **Spring Boot 3.2** (Web + Thymeleaf)
- **Maven**
- Frontend: czysty HTML/CSS/JS + **Bootstrap 5** (komponenty pomocnicze), wizualizacje SVG,
  dane pobierane asynchronicznie z REST API (`fetch`).

## 🚀 Jak uruchomić projekt?

### Wymagania
- **JDK 17** lub nowszy
- **Maven**

### Uruchomienie
```bash
mvn spring-boot:run
```
Następnie otwórz w przeglądarce: [http://localhost:8082/](http://localhost:8082/)

> Port konfigurowany w `src/main/resources/application.properties` (domyślnie **8082**).

## 🧪 Testy
```bash
mvn test
```

## 🔌 Najważniejsze endpointy API
| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/api/moon-info?date=YYYY-MM-DD` | Pełna informacja o księżycu dla daty (faza, oświetlenie, wiek, odległość, postęp cyklu, dni do pełni/nowiu) |
| `GET` | `/api/phases/year/{year}` | Wszystkie 8 faz dla danego roku |
| `GET` | `/api/phases/{date}` | Faza dla konkretnej daty |
| `GET` | `/api/illumination?date=YYYY-MM-DD` | Stopień oświetlenia (0.0–1.0) |

## 📐 Architektura
- `MoonCalculator` – czysta logika matematyczna (fazy, oświetlenie, odległość, wiek księżyca).
- `MoonService` – warstwa biznesowa, mapowanie na DTO.
- `MoonController` – widoki Thymeleaf (`/`, `/fullmoons`).
- `MoonApiController` – REST API zasilające frontend (JSON).
- `welcome.html` / `fullmoons.html` – zmodernizowane widoki z wizualizacjami SVG.