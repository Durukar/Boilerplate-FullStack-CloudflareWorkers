import { Search, Github, Lock, Globe, Plus, X, ExternalLink, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/theme/theme-provider'
import { ThemeToggle } from './components/theme/theme-toggle'
import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import { Input } from './components/ui/input'
import { useGitHubRepos } from './hooks/useGitHubRepos'
import './style.css'

export function App() {
  const { repository, loading, fetchGitRepos, updateGitRepos, clearRepos } = useGitHubRepos()
  const [token, setToken] = useState<string>('')
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set())
  const [typedTitle, setTypedTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25


  const totalPages = repository ? Math.ceil(repository.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRepos = repository?.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    if (repository && repository.length > 0) {

      setTypedTitle('')
      const textToType = repository[0].owner?.login || ''
      let currentText = ''
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < textToType.length) {
          currentText += textToType.charAt(i)
          setTypedTitle(currentText)
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 100)
      return () => clearInterval(typingInterval)
    } else {
      setTypedTitle('')
    }
  }, [repository])

  const handleClear = () => {
    setSelectedRepos(new Set())
    clearRepos()
    setToken('')
    setTypedTitle('')
    setCurrentPage(1)
  }

  const firstRepoOwnerAvatar = repository && repository.length > 0 ? repository[0].owner?.avatar_url : null

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault()
    if (token) {
      setSelectedRepos(new Set())
      setCurrentPage(1)
      fetchGitRepos(token)
    }
  }

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedRepos)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRepos(newSelected)
  }

  const toggleAll = () => {
    if (!paginatedRepos || paginatedRepos.length === 0) return


    const allCurrentPageSelected = paginatedRepos.every((r) => selectedRepos.has(r.id))

    if (allCurrentPageSelected) {

      const newSelected = new Set(selectedRepos)
      paginatedRepos.forEach((r) => newSelected.delete(r.id))
      setSelectedRepos(newSelected)
    } else {

      const newSelected = new Set(selectedRepos)
      paginatedRepos.forEach((r) => newSelected.add(r.id))
      setSelectedRepos(newSelected)
    }
  }

  const handleBulkAction = async (makePrivate: boolean) => {
    if (!repository) return
    const reposToUpdate = repository.filter((r) => selectedRepos.has(r.id))


    for (const repo of reposToUpdate) {
      if (repo.private !== makePrivate) {
        await updateGitRepos(repo.owner.login, repo.name, makePrivate, token)
      }
    }
    setSelectedRepos(new Set())
  }

  return (
    <ThemeProvider storageKey="gitHubRepositories" defaultTheme="dark">
      <div className="min-h-screen bg-background text-muted-foreground font-sans relative transition-colors duration-200 pb-4">

        <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-md border-b border-border/40 pt-10 pb-6 px-10 mb-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-8 relative">
              <h1 className="text-xl font-bold flex items-center gap-0 text-foreground drop-shadow-sm font-mono tracking-tight">
                GHH - GitHub Hub
                {typedTitle && (
                  <span className="text-foreground font-normal ml-2">{typedTitle}</span>
                )}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  className="inline-block w-2.5 h-5 bg-foreground align-middle ml-1"
                />
              </h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>

            <form onSubmit={handleFetch} className="flex items-center justify-end gap-3">
              {firstRepoOwnerAvatar ? (
                <img
                  src={firstRepoOwnerAvatar}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-md border border-border mr-2 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center mr-2">
                  <Github className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9 h-9 bg-card border-border focus-visible:ring-1 focus-visible:ring-ring shadow-none text-sm font-mono placeholder:text-muted-foreground rounded-md text-foreground"
                    placeholder="Personal Access Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>

                <div className="relative group flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />

                  <div className="absolute top-full mt-2 right-0 w-80 p-5 bg-popover/95 backdrop-blur-sm text-popover-foreground border border-border/40 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none text-left">
                    <h4 className="font-semibold text-sm mb-2 text-foreground">How to get your Token</h4>
                    <ol className="text-xs space-y-2 list-decimal list-outside ml-4 text-muted-foreground">
                      <li>Go to GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens (classic).</li>
                      <li>Click <strong>Generate new token (classic)</strong>.</li>
                      <li>Check the <strong className="text-foreground">repo</strong> scope box (required for viewing private repos and modifying visibility).</li>
                      <li>Generate and paste your token here.</li>
                    </ol>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleClear}
                variant="outline"
                className="h-9 px-3 rounded-md border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-9 w-[140px] rounded-md bg-primary hover:bg-primary/90 text-primary-foreground border-transparent transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading && !repository?.length ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Search className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Fetch Repos
                  </>
                )}
              </Button>
            </form>
          </div>
        </header>


        <main className="max-w-[1200px] mx-auto px-10">
          <div className="w-full">

            <div
              className="grid gap-4 pb-3 mb-2 text-xs font-medium text-muted-foreground border-b border-border"
              style={{ gridTemplateColumns: '50px minmax(200px, 3.5fr) 100px 100px minmax(150px, 2fr) 150px' }}
            >
              <div className="pl-4">
                <Checkbox
                  checked={(paginatedRepos?.length ?? 0) > 0 && paginatedRepos?.every(r => selectedRepos.has(r.id))}
                  onCheckedChange={toggleAll}
                  disabled={!paginatedRepos?.length || loading}
                  className="rounded-[3px] border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
                />
              </div>
              <div>Repository</div>
              <div className="text-center">Visibility</div>
              <div className="text-center">Status</div>
              <div className="text-center min-w-0">URL</div>
              <div className="text-right pr-4">Repository ID</div>
            </div>


            <div className="flex flex-col min-h-[500px]">
              <AnimatePresence mode="wait">
                {(!paginatedRepos || paginatedRepos.length === 0) && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center text-muted-foreground text-sm">
                    Enter your token to view repositories.
                  </motion.div>
                )}

                {paginatedRepos?.map((repo, index) => {
                  const isSelected = selectedRepos.has(repo.id)
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                      key={repo.id}
                      className={`grid gap-4 py-3 items-center rounded-md transition-all duration-200 text-sm border border-transparent hover:border-border/50 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/5 ${isSelected ? 'bg-muted/80 shadow-md border-border/50' : 'hover:bg-muted/40'}`}
                      style={{ gridTemplateColumns: '50px minmax(200px, 3.5fr) 100px 100px minmax(150px, 2fr) 150px' }}
                    >
                      <div className="pl-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(repo.id)}
                          disabled={loading}
                          className="rounded-[3px] border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-3 font-medium text-foreground min-w-0 pr-4">
                        <Github className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </div>


                      <div className="flex justify-center">
                        {repo.private ? (
                          <span className="relative overflow-hidden inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-bold bg-secondary text-secondary-foreground">
                            <span className="relative z-10">PRIVATE</span>
                            <span className="animate-wave absolute inset-0 pointer-events-none" />
                          </span>
                        ) : (
                          <span className="relative overflow-hidden inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-bold bg-primary text-primary-foreground">
                            <span className="relative z-10">PUBLIC</span>
                            <span className="animate-wave absolute inset-0 pointer-events-none" />
                          </span>
                        )}
                      </div>


                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="w-5 h-5 rounded-sm flex items-center justify-center bg-muted border border-border text-[9px] font-bold text-foreground">A</span>
                        Active
                      </div>

                      <div className="flex justify-center min-w-0">
                        <a
                          href={repo.html_url || repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group truncate"
                        >
                          <span className="truncate">View Repo</span> <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      </div>

                      <div className="font-mono text-xs text-muted-foreground text-right pr-4">
                        {repo.id}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>


            {totalPages > 1 && (
              <div className="flex items-center justify-between py-4 mt-2 border-t border-border/40">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(startIndex + itemsPerPage, repository?.length || 0)}</span> of <span className="font-medium text-foreground">{repository?.length}</span> repositories
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="h-8 px-3 text-xs bg-card border-border hover:bg-muted"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center justify-center min-w-[32px] h-8 text-xs font-medium rounded-md bg-muted/50 border border-border/50 text-foreground">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="h-8 px-3 text-xs bg-card border-border hover:bg-muted"
                  >
                    Next <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>


        <AnimatePresence>
          {selectedRepos.size > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-card/70 backdrop-blur-md border border-border/60 shadow-2xl shadow-black/20 rounded-lg flex items-center gap-2 min-w-[360px] p-2">
                <div className="flex items-center gap-3 px-3 text-muted-foreground text-sm font-medium">
                  <div className="bg-muted text-foreground w-6 h-6 rounded-sm flex items-center justify-center text-xs border border-border/50 shadow-sm">
                    {selectedRepos.size}
                  </div>
                  selected
                </div>

                <div className="flex gap-1 flex-1 px-2 border-l border-border">
                  <Button
                    onClick={() => handleBulkAction(false)}
                    disabled={loading || !repository?.some(r => selectedRepos.has(r.id) && r.private)}
                    variant="ghost"
                    className="flex-1 h-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors disabled:opacity-30 rounded-[4px] font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 mr-2" /> Make Public
                  </Button>
                  <Button
                    onClick={() => handleBulkAction(true)}
                    disabled={loading || !repository?.some(r => selectedRepos.has(r.id) && !r.private)}
                    variant="ghost"
                    className="flex-1 h-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors disabled:opacity-30 rounded-[4px] font-medium"
                  >
                    <Lock className="w-3.5 h-3.5 mr-2" /> Make Private
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  )
}

export default App