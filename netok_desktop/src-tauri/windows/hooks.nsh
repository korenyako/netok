; Kill sing-box before install/update so NSIS can overwrite the binary.
; Also kill the main app to release all file locks.

!macro NSIS_HOOK_PREINSTALL
  nsExec::Exec 'taskkill /F /IM "sing-box.exe"'
  nsExec::Exec 'taskkill /F /IM "sing-box-x86_64-pc-windows-msvc.exe"'
  nsExec::Exec 'taskkill /F /IM "Netok.exe"'
  ; Give OS time to release file locks
  Sleep 1000
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  nsExec::Exec 'taskkill /F /IM "sing-box.exe"'
  nsExec::Exec 'taskkill /F /IM "sing-box-x86_64-pc-windows-msvc.exe"'
  nsExec::Exec 'taskkill /F /IM "Netok.exe"'
  Sleep 1000
!macroend
