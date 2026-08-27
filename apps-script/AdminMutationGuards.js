function adminArchiveDataReactGuard_(token,tableKey,id) {
  if(adminMutationProtectedTable_(tableKey))throw new Error('Este registro es generado por el sistema y es de solo lectura.');
  return adminArchiveData(token,tableKey,id);
}

function adminHardDeleteDataReactGuard_(token,tableKey,id) {
  if(adminMutationProtectedTable_(tableKey))throw new Error('Este registro es generado por el sistema y es de solo lectura.');
  return adminHardDeleteData(token,tableKey,id);
}
