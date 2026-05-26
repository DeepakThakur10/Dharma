import { useState } from 'react';
import { Plus, Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from './useBookmarks';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function BookmarksPage() {
    const { data: bookmarks, isLoading } = useBookmarks();
    const createMutation = useCreateBookmark();
    const deleteMutation = useDeleteBookmark();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;
        await createMutation.mutateAsync({ title: title.trim(), url: url.trim() });
        setTitle('');
        setUrl('');
        setShowForm(false);
    };

    return (
        <>
            <Header title="Bookmarks" subtitle={`${bookmarks?.length || 0} saved`} />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>Your Bookmarks</h2>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Save useful links for quick access</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4" /> Add Bookmark
                    </Button>
                </div>

                {/* Add form */}
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                        <Card>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    placeholder="Bookmark title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" loading={createMutation.isPending}>Save</Button>
                                    <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {/* Bookmarks list */}
                {isLoading ? (
                    <PageSpinner />
                ) : !bookmarks?.length ? (
                    <EmptyState
                        icon={Bookmark}
                        title="No bookmarks yet"
                        description="Save useful links for quick access"
                        action={<Button onClick={() => setShowForm(true)} size="sm"><Plus className="w-4 h-4" /> Add Bookmark</Button>}
                    />
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                    >
                        {bookmarks.map((b) => (
                            <motion.div
                                key={b.id}
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                            >
                                <Card className="group flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-amber-950/20">
                                        <Bookmark className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{b.title}</p>
                                        <a
                                            href={b.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center gap-1 truncate hover:underline"
                                            style={{ color: 'var(--brand)' }}
                                        >
                                            {b.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                            {b.createdAt ? formatDate(b.createdAt) : 'Just now'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteMutation.mutate(b.id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </>
    );
}
