import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function MessageList() {
  const [showCompose, setShowCompose] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const messageThreads = useQuery(api.messages.getMessages) || [];
  const conversation = useQuery(
    api.messages.getConversation,
    selectedThread ? { threadId: selectedThread } : "skip"
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Messages</h2>
          <p className="text-gray-600">Communicate with instructors and peers</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span className="text-lg">✉️</span>
          <span>Compose Message</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Threads */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-xl mr-2">💬</span>
                Conversations
              </h3>
            </div>
            <div className="divide-y">
              {messageThreads.length > 0 ? (
                messageThreads.map((thread, index) => {
                  const latestMessage = thread[thread.length - 1];
                  const threadId = latestMessage.threadId || latestMessage._id;
                  return (
                    <button
                      key={threadId}
                      onClick={() => setSelectedThread(threadId)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors rounded-xl mx-2 my-1 ${
                        selectedThread === threadId ? "bg-gradient-to-r from-teal/10 to-navy/10 border-l-4 border-teal" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {latestMessage.subject}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {latestMessage.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(latestMessage._creationTime).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">✉️</div>
                  <p>No messages yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <div className="bg-white rounded-2xl shadow-soft">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {conversation[0]?.subject || "Conversation"}
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((message) => (
                  <div key={message._id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {message.sender?.profile?.firstName} {message.sender?.profile?.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(message._creationTime).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-100">
                <button className="btn-primary">
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a conversation</h3>
              <p className="text-gray-600 max-w-md mx-auto">Choose a conversation from the left to view messages and continue your discussion</p>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeMessageModal onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
}

function ComposeMessageModal({ onClose }: { onClose: () => void }) {
  const [recipientId, setRecipientId] = useState<Id<"users"> | "">("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = useMutation(api.messages.sendMessage);
  const users = useQuery(api.users.getAllUsers) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMessage({
        recipientId: recipientId as Id<"users">,
        subject: subject.trim(),
        content: content.trim(),
      });
      toast.success("Message sent successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-large">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Compose Message</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="recipient" className="form-label">
                To
              </label>
              <select
                id="recipient"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value as Id<"users"> | "")}
                className="form-input"
                required
              >
                <option value="">Select recipient...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.profile?.firstName} {user.profile?.lastName} ({user.profile?.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="content" className="form-label">
                Message
              </label>
              <textarea
                id="content"
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-input resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
