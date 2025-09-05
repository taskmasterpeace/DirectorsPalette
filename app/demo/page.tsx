"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Grid, Square, ChevronRight, Menu, Sparkles, BarChart3 } from "lucide-react"
import Link from "next/link"

const PROTOTYPES = [
  {
    id: "a-enhanced",
    title: "Smart Tags with Full Database",
    icon: <Star className="h-5 w-5" />,
    description: "Smart tags approach with complete 430+ genre database and advanced search capabilities",
    features: ["430+ genres", "Smart pagination", "Advanced wildcards", "Real-time filtering"],
    bestFor: "Quick access to any genre from the complete database with intelligent display limiting",
    path: "/demo/genre-prototype-a-enhanced",
    enhanced: true
  },
  {
    id: "b-enhanced",
    title: "Split-Pane Explorer with Full Database",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Complete 4-tier hierarchy with real genre database (430+ genres) and advanced drill-down",
    features: ["4-tier hierarchy", "430+ genres", "Real database", "Batch selection", "Space-saving drill-down"],
    bestFor: "Production-ready implementation with full genre navigation capabilities",
    path: "/demo/genre-prototype-b-enhanced",
    enhanced: true
  },
  {
    id: "c-enhanced",
    title: "Modal Powerhouse with Full Database",
    icon: <Square className="h-5 w-5" />,
    description: "Advanced modal with complete genre database, category navigation, and batch operations",
    features: ["430+ genres", "Category expansion", "Batch selection", "Hierarchy navigation"],
    bestFor: "Power users who need full database access with advanced management features",
    path: "/demo/genre-prototype-c-enhanced",
    enhanced: true
  },
  {
    id: "e-enhanced",
    title: "Sidebar Drawer with Full Database",
    icon: <Menu className="h-5 w-5" />,
    description: "Production-ready sidebar with complete genre database and intelligent organization",
    features: ["430+ genres", "Smart suggestions", "Tabbed organization", "Performance optimized"],
    bestFor: "Production forms requiring comprehensive genre access without workflow disruption",
    path: "/demo/genre-prototype-e-enhanced",
    enhanced: true
  }
]

export default function DemoIndex() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/create">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Music Video
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Enhanced Genre Selection Prototypes</h1>
            <p className="text-slate-400 mt-2">
              4 production-ready approaches using the complete 430+ genre database
            </p>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Design Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3">
            <p>
              <strong>Goal:</strong> Create a reusable genre selection component for both Music Video Creator and Artist Bank 
              that supports 600+ genres with primary/sub/micro hierarchy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-white font-medium mb-2">Requirements:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Popular genres (Hip-Hop, Soul, Funk, Afrobeat, Drill)</li>
                  <li>• Advanced search with wildcards and quotes</li>
                  <li>• Favorites system with persistence</li>
                  <li>• Multi-selection support</li>
                  <li>• Space-efficient design</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Use Cases:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Music Video Creator genre field</li>
                  <li>• Artist Bank genre/subgenre/microgenre fields</li>
                  <li>• Must handle 3-tier hierarchy system</li>
                  <li>• Should improve current dead space issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Prototypes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {PROTOTYPES.map((prototype) => (
            <Card 
              key={prototype.id} 
              className={`transition-all ${
                (prototype as any).enhanced
                  ? "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-800/50 hover:border-purple-600/70"
                  : "bg-slate-900 border-slate-800 hover:border-slate-600"
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded ${
                    (prototype as any).enhanced ? "bg-purple-600" : "bg-blue-600"
                  }`}>
                    {prototype.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{prototype.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${
                        (prototype as any).enhanced 
                          ? "border-purple-500 text-purple-300" 
                          : ""
                      }`}
                    >
                      {(prototype as any).enhanced ? "Full Database ✨" : `Prototype ${prototype.id.toUpperCase()}`}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{prototype.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {prototype.features.map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="outline" 
                        className={`text-xs ${
                          (prototype as any).enhanced 
                            ? "border-purple-500 text-purple-300" 
                            : ""
                        }`}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Best For</h4>
                  <p className="text-xs text-slate-400">{prototype.bestFor}</p>
                </div>

                {/* Action */}
                <Link href={prototype.path}>
                  <Button 
                    className={`w-full ${
                      (prototype as any).enhanced 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : ""
                    }`}
                  >
                    {(prototype as any).enhanced ? "View Enhanced Version ✨" : `View Prototype ${prototype.id.toUpperCase()}`}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Matrix */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-300 p-3">Feature</th>
                    <th className="text-center text-slate-300 p-3">Smart Tags</th>
                    <th className="text-center text-slate-300 p-3">Split-Pane</th>
                    <th className="text-center text-slate-300 p-3">Modal</th>
                    <th className="text-center text-slate-300 p-3">Sidebar</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Complete database (430+ genres)</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">4-tier hierarchy navigation</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">➖</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Space-saving drill-down</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">➖</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Advanced search & wildcards</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Batch selection operations</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">➖</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Smart suggestions</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">Non-intrusive design</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">➖</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr>
                    <td className="p-3">Production ready</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}