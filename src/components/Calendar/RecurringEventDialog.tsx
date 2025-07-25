import React from 'react';
import { AlertCircle, Calendar, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

export type RecurringEventAction = 'edit' | 'delete';
export type RecurringEventScope = 'this' | 'thisAndFuture' | 'all';

interface RecurringEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: RecurringEventScope) => void;
  action: RecurringEventAction;
  eventTitle: string;
  isRecurringInstance: boolean;
}

export const RecurringEventDialog: React.FC<RecurringEventDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  eventTitle,
  isRecurringInstance,
}) => {
  const [selectedScope, setSelectedScope] =
    React.useState<RecurringEventScope>('this');

  const handleConfirm = () => {
    onConfirm(selectedScope);
    onClose();
  };

  const getActionText = () => {
    switch (action) {
      case 'edit':
        return 'edit';
      case 'delete':
        return 'delete';
      default:
        return 'modify';
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'edit':
        return <Edit className="h-5 w-5 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getDialogColor = () => {
    switch (action) {
      case 'delete':
        return 'text-red-600';
      case 'edit':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${getDialogColor()}`}
          >
            {getActionIcon()}
            {action === 'edit' ? 'Edit' : 'Delete'} Recurring Event
          </DialogTitle>
          <DialogDescription className="text-left">
            <span className="font-medium">&ldquo;{eventTitle}&rdquo;</span> is
            part of a recurring series. How would you like to {getActionText()}{' '}
            it?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedScope}
            onValueChange={(value) =>
              setSelectedScope(value as RecurringEventScope)
            }
            className="space-y-4"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="this" className="mt-1" />
              <div className="space-y-1">
                <Label className="font-medium">Only this event</Label>
                <p className="text-sm text-muted-foreground">
                  {action === 'edit'
                    ? 'Modify only this occurrence, keeping other events in the series unchanged.'
                    : 'Delete only this occurrence, keeping other events in the series.'}
                </p>
              </div>
            </div>

            {isRecurringInstance && (
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="thisAndFuture" className="mt-1" />
                <div className="space-y-1">
                  <Label className="font-medium">This and future events</Label>
                  <p className="text-sm text-muted-foreground">
                    {action === 'edit'
                      ? 'Modify this event and all future occurrences in the series.'
                      : 'Delete this event and all future occurrences in the series.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="all" className="mt-1" />
              <div className="space-y-1">
                <Label className="font-medium">All events in the series</Label>
                <p className="text-sm text-muted-foreground">
                  {action === 'edit'
                    ? 'Modify all events in this recurring series.'
                    : 'Delete the entire recurring series.'}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {action === 'delete' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <strong>Warning:</strong> This action cannot be undone.
              {selectedScope === 'all' &&
                ' This will delete the entire recurring series.'}
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant={action === 'delete' ? 'destructive' : 'default'}
          >
            {action === 'edit' ? 'Edit' : 'Delete'} Event
            {selectedScope === 'all' && ' Series'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
