year = int(input("Wprowadz rok: \n"))

if year % 4 == 0:
    if year % 100 == 0:
        if year % 400 == 0:
            print("Rok przestępny")
        else:
            print("Rok nieprzestępny")
    else:
        print("Rok przestępny")
else:
    print("Rok nieprzestępny")