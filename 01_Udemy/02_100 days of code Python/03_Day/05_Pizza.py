# 🚨 Don't change the code below 👇
print("\nWelcome to Python Pizza Deliveries!")
size = input("\nWhat size pizza do you want? S, M, or L ")
add_pepperoni = input("Do you want pepperoni? Y or N ")
extra_cheese = input("Do you want extra cheese? Y or N ")
# 🚨 Don't change the code above 👆

#Write your code below this line 👇

price = 0

if size == 'S':
    price += 15
    if add_pepperoni == 'Y':
        price += 2

elif size == 'M':
    price += 20
    if add_pepperoni == 'Y':
        price += 3

elif size == 'L':
    price +=25
    if add_pepperoni == 'Y':
        price += 3

if extra_cheese == 'Y':
    price +=1

print(f'Final bill is ${price}\n')