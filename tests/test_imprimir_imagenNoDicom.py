import unittest
import numpy as np
from dicom_viewer import imprimirImagen

class TestImprimirImagen(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    def test_imprimirNoDicom(self):
        # Prueba básica de la función imprimirImagen
        imagen = [np.random.rand(10, 10)]  # Simular una imagen distinta a Dicom

        # Intentamos ejecutar la función y verificamos que no lance errores
        try:
            imprimirImagen(imagen)
        except Exception as e:
            self.fail(f"imprimirImagen lanzó una excepción inesperada: {e}")

    @classmethod
    def tearDownClass(cls):
        pass

if __name__ == "__main__":
    unittest.main()


