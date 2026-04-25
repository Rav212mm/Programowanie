package com.sdetlab.core;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class CalculatorTest {

    private final Calculator calculator = new Calculator();

    @Test
    @DisplayName("Dodawanie dwóch liczb")
    void shouldAddTwoNumbers() {
        // Given
        double a = 5.0;
        double b = 3.0;

        // When
        OperationResult result = calculator.add(a, b);

        // Then
        assertThat(result).isInstanceOf(Calculator.Success.class);
        assertThat(((Calculator.Success) result).result()).isEqualTo(8.0);
    }

    @Test
    @DisplayName("Dzielenie przez zero zwraca błąd")
    void shouldReturnErrorOnDivideByZero() {
        // When
        OperationResult result = calculator.div(10.0, 0.0);

        // Then
        assertThat(result).isInstanceOf(Calculator.Error.class);
        assertThat(((Calculator.Error) result).reason()).isEqualTo("Dzielenie przez zero");
    }

    @ParameterizedTest(name = "{0} * {1} = {2}")
    @CsvSource({
            "2, 3, 6",
            "0, 5, 0",
            "-2, 3, -6",
            "10, 0.5, 5"
    })
    @DisplayName("Mnożenie - testy parametryzowane")
    void shouldMultiply(double a, double b, double expected) {
        // When
        OperationResult result = calculator.mul(a, b);

        // Then
        assertThat(result).isInstanceOf(Calculator.Success.class);
        assertThat(((Calculator.Success) result).result()).isEqualTo(expected);
    }
}
