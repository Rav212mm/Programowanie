# Split string method
import random

names_string = input("Give me everybody's names, separated by a comma. ")
names = names_string.split(", ")

# 🚨 Don't change the code above 👆

#Write your code below this line 👇
print(names)

no = int(len(names))-1
print(no)

choice = random.randint(0, no)
print(choice)

print(names[choice])