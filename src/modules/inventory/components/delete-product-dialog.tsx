import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type DeleteProductDialogProps = {
  open: boolean
  productName: string
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({
  open,
  productName,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que querés eliminar «{productName}»? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11" disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="h-11"
            disabled={isPending}
            onClick={(event) => {
              // evita el cierre automático: el diálogo se cierra al terminar el DELETE
              event.preventDefault()
              onConfirm()
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
