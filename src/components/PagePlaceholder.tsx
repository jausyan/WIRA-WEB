import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PagePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Segera hadir</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">{note}</CardContent>
      </Card>
    </div>
  )
}
