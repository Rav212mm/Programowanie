h = float(input('\nPodaj wzrost w metrach\n'))
w = float(input('Podaj wagę w kg\n'))

BMI_index = round((w/h**2),2)

if BMI_index < 18.5:
    komunikat = "underweight"

elif 25 > BMI_index >= 18.5 :
    komunikat ="normal weight"

elif 30 > BMI_index >= 25:
    komunikat ="overweight"

elif 35 > BMI_index >= 30 and bmi < 35:
    komunikat ="obese"

else:
    komunikat ="clinicaly obese"

print(f'\nTwoj index BMi to {BMI_index} and is {komunikat}\n')