# Inspección de Código - SonarCloud

## Quality Issues Identificados

1. **Issue 1**
   - **Archivo**: `frontend/dicom_viewer/src/components/DicomViewer.js`
   - **Nombre**: Falta la validación de la prop filenames
   - **Severidad**: Major
   - **Tipo:** Code Smell
   - **Descripción:** Este problema sugiere que falta una validación para los "props" utilizados en React, lo cual podría provocar errores si se reciben datos inesperados.
   - **Recomendación**: Se podria agregar una validación de tipos de props usando PropTypes en React para asegurar que las propiedades filenames tengan el tipo esperado. Esta mejora ayudará a evitar errores de consistencia y de mantenibilidad."


2. **Issue 2**
   - **Archivo**: `backend/main.py`
   - **Nombre**: Cambiar el código para no construir la ruta con datos controlados por el usuario
   - **Severidad**: Blocker
   - **Tipo:** Security Vulnerability
   - **Descripción:** Este es un problema de seguridad severo, ya que el uso de rutas basadas en datos proporcionados por el usuario puede llevar a vulnerabilidades como "path traversal", donde el usuario podría acceder a rutas no deseadas en el sistema.
   - **Recomendación**: Se podria refactorizar el código para validar los datos proporcionados por el usuario antes de construir rutas con ellos. Esto evitará vulnerabilidades críticas de seguridad.


## Resumen y Acciones

Si bien la Issue 2 es mas riesgosa ya que implica vulnerabilidad en la seguridad de la aplicacion por el momento no se abordara. Esta
decision se debe a que esta issue es más compleja de corregir porque implica refactorizar el código, además, requiere una comprensión 
detallada de cómo se manejan las rutas en el código y qué datos de usuario están involucrados, lo cual puede requerir tiempo adicional 
de análisis y pruebas para asegurar que la solución sea segura y no introduzca nuevos problemas. Por lo tanto, se decide abordar la Issue 1, 
pues esta issue es relativamente fácil de corregir. Se puede añadir validación de props en React mediante PropTypes lo cual solo requiere 
identificar los tipos de props esperados y definirlos en la configuración de PropTypes. Esto ultimo no pone en riesgo todo el progreso que 
lleva la aplicacion hasta ahora y cumple con que puede ser reparado en el tiempo limite.