import unittest
import os
from dicom_viewer import importarImagenes

class TestImportarImagenes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.valid_path = "test_data/"
        cls.invalid_path = "invalid_data/"
        # Crear directorios de prueba si no existen
        if not os.path.exists(cls.valid_path):
            os.makedirs(cls.valid_path)
        # Crear un archivo de prueba
        with open(cls.valid_path + "test_file.dcm", "w") as f:
            f.write("Fake DICOM content")

    def test_importar_imagenes_validas(self):
        # Prueba con directorio válido con imágenes
        imagenes = importarImagenes(self.valid_path)
        # Verificar que devuelve una lista
        self.assertIsInstance(imagenes, list)
        # Verificar que hay al menos una imagen importada
        self.assertGreater(len(imagenes), 0)

    def test_importar_imagenes_invalidas(self):
        # Prueba con un directorio inexistente o vacío
        with self.assertRaises(FileNotFoundError):
            importarImagenes(self.invalid_path)

    @classmethod
    def tearDownClass(cls):
        # Limpiar directorios de prueba después de las pruebas
        if os.path.exists(cls.valid_path):
            os.remove(cls.valid_path + "test_file.dcm")
            os.rmdir(cls.valid_path)

if __name__ == "__main__":
    unittest.main()
