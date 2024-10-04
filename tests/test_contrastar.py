import unittest
import numpy as np
from dicom_viewer import contrastar

class TestContrastar(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    def test_contrastar_frontera(self):
        # Prueba con imagen que tiene valores justo en el umbral
        imagen_prueba = np.array([[99, 100, 101], [50, 150, 200]])
        umbral = 100
        imagen_esperada = np.array([[0, 255, 255], [0, 255, 255]])
        
        # Verificar que los valores por debajo del umbral son 0, y los iguales o superiores son 255
        imagen_resultante = contrastar(imagen_prueba, umbral)
        np.testing.assert_array_equal(imagen_resultante, imagen_esperada)

    def test_contrastar_imagen_vacia(self):
        # Prueba con imagen vacía
        imagen_prueba = np.array([])
        umbral = 100
        imagen_esperada = np.array([])
        
        # Verificar que la imagen vacía no provoca errores y se devuelve vacía
        imagen_resultante = contrastar(imagen_prueba, umbral)
        np.testing.assert_array_equal(imagen_resultante, imagen_esperada)

    @classmethod
    def tearDownClass(cls):
        pass

if __name__ == "__main__":
    unittest.main()
