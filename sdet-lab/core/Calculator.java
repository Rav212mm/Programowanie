package com.sdetlab.core;

// Sealed interface pozwala nam kontrolować, które klasy mogą ją implementować
public sealed interface OperationResult permits Calculator.Success, Calculator.Error {
    String message();
}

public class Calculator {

    // Record to immutable data carrier
    public record Success(double result) implements OperationResult {
        @Override
        public String message() {
            return "Wynik: " + result;
        }
    }

    // Record dla błędu
    public record Error(String reason) implements OperationResult {
        @Override
        public String message() {
            return "Błąd: " + reason;
        }
    }

    public OperationResult add(double a, double b) {
        return new Success(a + b);
    }

    public OperationResult sub(double a, double b) {
        return new Success(a - b);
    }

    public OperationResult mul(double a, double b) {
        return new Success(a * b);
    }

    public OperationResult div(double a, double b) {
        if (b == 0) {
            return new Error("Dzielenie przez zero");
        }
        return new Success(a / b);
    }
}
