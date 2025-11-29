# 🚨 Don't change the code below 👇

from pickletools import int4


student_heights = input("Input a list of student heights ").split()
for n in range(0, len(student_heights)):
  student_heights[n] = int(student_heights[n])

# 🚨 Don't change the code above 👆

print(student_heights)

no = 0
suma = 0

for student in student_heights:
    no += 1
    suma += student

srednia = (int(suma/no))

print(f"Jest {no} studentów gdzie suma wzrostu jest {suma}cm a średnia wynosi {srednia}cm")

#Write your code below this row 👇