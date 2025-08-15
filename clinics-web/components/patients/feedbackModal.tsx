import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function FeedbackModal({ feedbacks, onClose, open }: { feedbacks: {id: string, feedback: string, createdAt: string}[], onClose: () => void, open: boolean }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Feedbacks</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="flex items-center justify-between border border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-md p-4">
                            <h1 className="text-sm text-gray-500 dark:text-gray-400">{feedback.feedback}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{feedback.createdAt.split("T")[0]}</p>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}