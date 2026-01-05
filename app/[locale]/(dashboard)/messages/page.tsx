import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30">
      <div className="text-center text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-medium mb-1">Your messages</h2>
        <p className="text-sm">Select a conversation to start messaging</p>
      </div>
    </div>
  )
}
