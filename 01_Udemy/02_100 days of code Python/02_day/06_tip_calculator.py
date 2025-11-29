# Tip calculator

print('\nWelcome to the tip calculator\n')
bill = float(input("What was the total bill? $"))
tip = int(input("Jaki napiwek? 10, 12 czy 15? "))
osoby = int(input("Ile osób do podziału rachunku? "))

cost = round((bill *(1+tip/100))/osoby,2)
cost_final = "{:.2f}".format(cost)

print(f'Każda osoba ma zapłacić: ${cost_final}\n')