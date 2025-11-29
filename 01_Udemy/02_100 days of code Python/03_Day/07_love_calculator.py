# True Love

# 🚨 Don't change the code below 👇

print("Welcome to the Love Calculator!")
name1 = input("What is your name? \n")
name2 = input("What is their name? \n")
# 🚨 Don't change the code above 👆

#Write your code below this line 👇
combined_string = name1 + name2
lower_case_string = combined_string.lower()

count_1 = 0
count_t = lower_case_string.count("t")
count_r = lower_case_string.count("r")
count_u = lower_case_string.count("u")
count_e = lower_case_string.count("e")

count_1 = count_t +count_r + count_u + count_e
print(count_1)

count_2 = 0
count_l = lower_case_string.count("l")
count_o = lower_case_string.count("o")
count_v = lower_case_string.count("v")
count_e = lower_case_string.count("e")

count_2 = count_l +count_o + count_v + count_e
print(count_2)

wynik = str(count_1) + str(count_2)
print(wynik)
wynik_int = int(wynik)

if wynik_int < 10 or wynik_int > 90:
    print(f'Your score is {wynik}, you go together like coke and mentos.')
elif wynik_int < 50 or wynik_int > 40:
    print(f'Your score is {wynik}, you are alright together.')
else:
    print(f"Your score is {wynik}, you are alright together.")