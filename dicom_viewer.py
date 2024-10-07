import pydicom as dcm
import matplotlib.pyplot as plt
import numpy as np
import os
from pydicom.errors import InvalidDicomError

def scroll(event): #Funcion que maneja el scroll de la rueda del mouse
    global imageIndex, colormap
    if event.button == 'up': #Scroll hacia arriba
        imageIndex = (imageIndex + 1) % len(imagenes)
    elif event.button == 'down': #Scroll hacia abajo
        imageIndex = (imageIndex - 1) % len(imagenes)
    
    image.set_data(imagenes[imageIndex].pixel_array.astype(np.float32))
    axs.draw_artist(image)
    plt.pause(0.001)

def onclick(event):
    global click_coords
    coord_x = event.xdata
    coord_y = event.ydata

    if coord_x is not None and coord_y is not None:
        click_coords.append((coord_x, coord_y))
        print(f'Coordenadas del clic: ({coord_x:.2f}, {coord_y:.2f})')
        
        # Calcular la distancia si hay dos puntos
        if len(click_coords) == 2:
            distance = calcular_distancia(click_coords[0], click_coords[1])
            print(f'Distancia entre los puntos: {distance:.2f}')
            click_coords = []  # Reiniciar la lista para el siguiente par de clics


# Función para cambiar el contraste de una lista de imágenes
def contrastar(imageList, umbral):

    imagenesContrastadas = []

    #Verifica que la imagen sea de tipo DICOM
    for imagen in imageList:
        if hasattr(imagen, 'pixel_array'):
            array = imagen.pixel_array
        else:
            array = imagen # En caso de no ser DICOM se agrega a un arreglo generico

        # Aplicar el umbral
        array[array < umbral] = 0
        array[array >= umbral] = 255

        if hasattr(imagen, 'PixelData'):
            #Convertir el array modificado de nuevo a bytes y asignarlo a PixelData
            imagen.PixelData = array.tobytes()
            imagenesContrastadas.append(imagen)
        else:
            imagenesContrastadas.append(array)
    
    return imagenesContrastadas



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
            try:
                #Usar force=True para forzar la lectura
                imagenes.append(dcm.dcmread(path + "\\" + archivo, force=True))
            except InvalidDicomError as e:
                print(f"Error al leer {archivo}: {e}")
    return imagenes


def calcular_distancia(p1, p2):
    # Calcular la distancia euclidiana entre dos puntos
    return np.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

#imprimir imagenes
def imprimirImagen(imagenes):
    print("Mapa de color:")
    print("\t1.- Grises \n\t2.- Verdes \n\t3.- Frío-Caliente \n\t")

    global axs, colormap, image, imageIndex, fig

    fig, axs = plt.subplots()

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

    #Grado de contraste
    if(choice.upper() == "S"):
        contraste = True
        grado_contraste = int(input("Ingrese el grado de contraste (El valor debe estar entre 0 y 255): "))
        imagenes = contrastar(imagenes, grado_contraste)
        
    elif(choice.upper() == "N"):
        contraste = False

    imageIndex = 0   
    image = axs.imshow(imagenes[imageIndex].pixel_array.astype(np.float32), colormap)
    cid_scroll = fig.canvas.mpl_connect('scroll_event', scroll)
    cid_click = fig.canvas.mpl_connect('button_press_event', onclick)

    plt.show()
    plt.ion()


click_coords = []
path = str(input("Ingrese el path a la carpeta donde se almacenan las imagenes: "))
#cantidadImagenes = int(input("¿Cuantas imagenes quiere mostrar?: "))
imagenes = importarImagenes(path)
imprimirImagen(imagenes)
