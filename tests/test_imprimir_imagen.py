import unittest
import numpy as np
from dicom_viewer import imprimirImagen

class TestImprimirImagen(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    def test_imprimirImagen(self):
        # Prueba básica de la función imprimirImagen
        imagenes = [np.random.rand(10, 10) for _ in range(2)]  # Simular dos imágenes aleatorias
        cantidad = 2

        # Intentamos ejecutar la función y verificamos que no lance errores
        try:
            imprimirImagen(imagenes, cantidad)
        except Exception as e:
            self.fail(f"imprimirImagen lanzó una excepción inesperada: {e}")

    @classmethod
    def tearDownClass(cls):
        pass

if __name__ == "__main__":
    unittest.main()

