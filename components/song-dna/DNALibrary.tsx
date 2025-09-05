"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  getAllSavedDNA, 
  deleteSongDNA, 
  exportDNAToJSON,
  importDNAFromJSON,
  exportAllDNA
} from "@/app/actions/song-dna/manage"
import type { StoredSongDNA } from "@/lib/song-dna-db"
import type { SongDNA } from "@/lib/song-dna-types"
import { 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  MoreVertical,
  Music,
  Calendar,
  Tag,
  Dna,
  FileJson,
  FolderOpen,
  Copy,
  Play
} from "lucide-react"

interface DNALibraryProps {
  onSelectDNA?: (dna: SongDNA) => void
  onGenerateFromDNA?: (dna: SongDNA) => void
}

export function DNALibrary({ onSelectDNA, onGenerateFromDNA }: DNALibraryProps) {
  const [savedDNAs, setSavedDNAs] = useState<StoredSongDNA[]>([])
  const [filteredDNAs, setFilteredDNAs] = useState<StoredSongDNA[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")

  // Load saved DNAs
  const loadDNAs = async () => {
    setLoading(true)
    try {
      const result = await getAllSavedDNA()
      if (result.success && result.data) {
        setSavedDNAs(result.data)
        setFilteredDNAs(result.data)
      }
    } catch (error) {
      console.error("Error loading DNAs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDNAs()
  }, [])

  // Filter DNAs based on search and tab
  useEffect(() => {
    let filtered = [...savedDNAs]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.metadata.title?.toLowerCase().includes(query) ||
        item.metadata.artist?.toLowerCase().includes(query) ||
        item.dna.reference_song.title?.toLowerCase().includes(query) ||
        item.dna.reference_song.artist?.toLowerCase().includes(query) ||
        item.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply tab filter
    if (selectedTab === "recent") {
      // Sort by most recent first
      filtered.sort((a, b) => 
        new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
      ).slice(0, 10)
    } else if (selectedTab === "favorites") {
      // Filter by favorite tag
      filtered = filtered.filter(item => 
        item.metadata.tags?.includes("favorite")
      )
    }

    setFilteredDNAs(filtered)
  }, [searchQuery, selectedTab, savedDNAs])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this DNA?")) {
      const result = await deleteSongDNA(id)
      if (result.success) {
        await loadDNAs()
      }
    }
  }

  const handleExport = async (id: string) => {
    const result = await exportDNAToJSON(id)
    if (result.success && result.data) {
      // Create download
      const blob = new Blob([result.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `song-dna-${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleExportAll = async () => {
    const result = await exportAllDNA()
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `song-dna-library-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = async () => {
    if (!importData) return
    
    try {
      const result = await importDNAFromJSON(importData)
      if (result.success) {
        setImportDialogOpen(false)
        setImportData("")
        await loadDNAs()
      }
    } catch (error) {
      console.error("Import error:", error)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DNA Library</h2>
          <p className="text-muted-foreground">
            Manage your saved Song DNA patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Song DNA</DialogTitle>
                <DialogDescription>
                  Upload a JSON file or paste DNA data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or paste JSON
                    </span>
                  </div>
                </div>
                <textarea
                  className="w-full h-32 p-2 border rounded-md font-mono text-xs"
                  placeholder="Paste JSON data here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                />
                <Button 
                  onClick={handleImport} 
                  disabled={!importData}
                  className="w-full"
                >
                  Import DNA
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, artist, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All DNAs</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading DNA library...
              </div>
            ) : filteredDNAs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No DNAs found matching your search"
                      : "No saved DNAs yet. Analyze a song to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="grid gap-4">
                  {filteredDNAs.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {item.metadata.title || item.dna.reference_song.title}
                            </CardTitle>
                            <CardDescription>
                              {item.metadata.artist || item.dna.reference_song.artist}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onSelectDNA && (
                                <DropdownMenuItem 
                                  onClick={() => onSelectDNA(item.dna)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Use DNA
                                </DropdownMenuItem>
                              )}
                              {onGenerateFromDNA && (
                                <DropdownMenuItem 
                                  onClick={() => onGenerateFromDNA(item.dna)}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Generate Song
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleExport(item.id)}
                              >
                                <FileJson className="h-4 w-4 mr-2" />
                                Export JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* DNA Stats */}
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Music className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {item.dna.lyrical.syllables_per_line.average.toFixed(1)} syl/line
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dna className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {item.dna.emotional.primary_emotion}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {formatDate(item.saved_at)}
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          {item.metadata.tags && item.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(item.metadata.tags || []).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {item.metadata.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.metadata.notes}
                            </p>
                          )}

                          {/* Themes */}
                          {item.dna.lyrical.themes && item.dna.lyrical.themes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(item.dna.lyrical.themes || []).slice(0, 3).map((theme, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                              {item.dna.lyrical.themes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.dna.lyrical.themes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}