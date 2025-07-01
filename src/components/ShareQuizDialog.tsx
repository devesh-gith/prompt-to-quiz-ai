
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Loader2 } from 'lucide-react'

interface ShareQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTitle: string
  defaultDescription?: string
  organizationName: string
  isSharing: boolean
  onShare: (title: string, description: string) => void
}

const ShareQuizDialog = ({
  open,
  onOpenChange,
  defaultTitle,
  defaultDescription = '',
  organizationName,
  isSharing,
  onShare
}: ShareQuizDialogProps) => {
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)

  const handleShare = () => {
    onShare(title.trim(), description.trim())
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSharing) {
      // Reset form when closing
      setTitle(defaultTitle)
      setDescription(defaultDescription)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Quiz with {organizationName}</span>
          </DialogTitle>
          <DialogDescription>
            Customize the quiz details before sharing with your organization. The quiz will be available for 1 hour.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title..."
              disabled={isSharing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of the quiz..."
              className="min-h-[80px] resize-none"
              disabled={isSharing}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            disabled={isSharing || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareQuizDialog
