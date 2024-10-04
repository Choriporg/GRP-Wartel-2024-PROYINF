import pydicom as dcm
import matplotlib.pyplot as plt
import numpy as np
import os

#Funcion para cambiar el contraste
def contrastar(imagen, umbral):
    imagenContrastada = imagen.copy()
    imagenContrastada[imagenContrastada < umbral] = 0
    imagenContrastada[imagenContrastada >= umbral] = 255
    return imagenContrastada

#importar todas las imagenes de la carpeta
def importarImagenes(path):
    files = []
    imagenes = []

    #Obteniendo nombres de los archivos
    with os.scandir(path) as ficheros:
        for file in ficheros:
            imagen = str(file).split()
            files.append(imagen[1][1:-2])

        for archivo in files:
            imagenes.append(dcm.dcmread(path + "\\" + archivo))

    return imagenes

#imprimir imagenes
def imprimirImagen(imagenes, cantidad):
    print("Mapa de color:")
    print("\t1.- Grises \n\t2.- Verdes \n\t3.- Frío-Caliente \n\t")

    fig, axs = plt.subplots(nrows=1, ncols =cantidad, figsize=(13,5))

    #Definir colormap
    choice = int(input("Ingrese mapa de color: "))
    if(choice == 1):
        colormap = "gray"
    elif(choice == 2):
        colormap = "viridis"
    elif(choice == 3):
        colormap = "coolwarm"

    #Manejo del contraste de la imagen
    contraste = False

    choice = str(input("¿Quiere contrastar las imagenes? (S/N):"))
    grado_contraste = 0
    if(choice.upper() == "S"):
        contraste = True
        grado_contraste = int(input("Ingrese el grado de contraste (El valor debe estar entre 0 y 255): "))
        
    elif(choice.upper() == "N"):
        contraste = False

    i = 0    
    while (i < cantidad):
        if(contraste):
            axs[i].imshow(contrastar(imagenes[i].pixel_array, grado_contraste), cmap=colormap)
        else:
            axs[i].imshow(imagenes[i].pixel_array, cmap=colormap)
        i +=1
    plt.show()


path = str(input("Ingrese el path a la carpeta donde se almacenan las imagenes: "))
cantidadImagenes = int(input("¿Cuantas imagenes quiere mostrar?: "))
imagenes = importarImagenes(path)
imprimirImagen(imagenes, cantidadImagenes)
