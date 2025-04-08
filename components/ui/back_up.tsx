'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ParameterSlider } from '@/components/ui/parameter-slider';
import dynamic from 'next/dynamic';

// Define proper types for the graph data
interface GraphNode {
  id: number;
}

interface GraphLink {
  source: number;
  target: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Dynamic import for the ForceGraph3D component to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-36 bg-gray-200 rounded-lg flex items-center justify-center">
      Loading...
    </div>
  ),
});

// Function to generate random tree data
function genRandomTree(N = 15, reverse = false): GraphData {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => {
        if (reverse) {
          return {
            target: id,
            source: Math.round(Math.random() * (id - 1)),
          };
        } else {
          return {
            source: id,
            target: Math.round(Math.random() * (id - 1)),
          };
        }
      }),
  };
}

export default function Home() {
  const [energy, setEnergy] = useState(0.0);
  const [tempo, setTempo] = useState(0.0);
  const [imageUrl, setImageUrl] = useState('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  // Create a ref to access the ForceGraph3D instance
  const graphRef = useRef<any>(null);

  // Function to fetch image based on energy and tempo
  const fetchImageUrl = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/song/mood_picture?energy=${energy}&tempo=${tempo}`
      );
      const data = await response.json();
      setImageUrl(data.url); // Set the URL from the API response
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  // Initialize graph data when component mounts
  useEffect(() => {
    setGraphData(genRandomTree());
  }, []);

  // Run fetchImageUrl when component mounts or when energy/tempo change
  useEffect(() => {
    fetchImageUrl();
  }, [energy, tempo]);

  // Zoom control functions
  const zoomIn = () => {
    if (graphRef.current) {
      const currentDistance = graphRef.current.camera().position.z;
      graphRef.current.cameraPosition({ z: currentDistance * 0.7 });
    }
  };

  const zoomOut = () => {
    if (graphRef.current) {
      const currentDistance = graphRef.current.camera().position.z;
      graphRef.current.cameraPosition({ z: currentDistance * 1.3 });
    }
  };

  // Reset zoom to fit all nodes
  const resetZoom = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400); // 400ms transition duration
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl m-5">
        <CardContent className="flex space-x-6 px-8 py-2">
          {/* Left side: Image */}
          <div className="w-48 h-36 bg-gray-200 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Mood Image"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : null}
          </div>

          {/* Right side: Title and Text */}
          <div className="space-y-4 flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900">
              Title of the Card
            </h1>
            <p className="text-sm text-gray-500">
              This is the description or text that goes below the title. You can
              add more content here as needed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="space-y-4 px-8 py-2">
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Adjust Parameters</h1>
          </div>

          <div className="space-y-4">
            <ParameterSlider
              label="Tempo"
              value={tempo}
              onChange={(value) => setTempo(value)}
            />
            <ParameterSlider
              label="Energy"
              value={energy}
              onChange={(value) => setEnergy(value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* New 3D Force Graph Card with zoom controls */}
      <Card className="w-full max-w-lg shadow-xl m-5">
        <CardContent className="px-8 py-2">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              Music Relationship Graph
            </h1>
            <p className="text-sm text-gray-500">
              Visualizing connections between musical elements in a 3D
              force-directed graph.
            </p>
          </div>

          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {graphData && (
              <ForceGraph3D
                ref={graphRef}
                graphData={graphData}
                backgroundColor="#f9fafb"
                nodeColor={() => '#4f46e5'}
                linkColor={() => '#94a3b8'}
                width={450}
                height={260}
                controlType="orbit" // Use orbit controls for better zoom handling
                onEngineStop={() => {
                  // Auto-fit graph when it stabilizes
                  if (graphRef.current) {
                    graphRef.current.zoomToFit(400);
                  }
                }}
              />
            )}
          </div>

          <div className="flex justify-between mt-4">
            <div className="space-x-2">
              <Button onClick={zoomIn} className="text-sm" size="sm">
                Zoom In
              </Button>
              <Button onClick={zoomOut} className="text-sm" size="sm">
                Zoom Out
              </Button>
              <Button onClick={resetZoom} className="text-sm" size="sm">
                Reset View
              </Button>
            </div>
            <Button
              onClick={() =>
                setGraphData(genRandomTree(Math.floor(Math.random() * 10) + 10))
              }
              className="text-sm"
            >
              Regenerate Graph
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-lg shadow-xl m-5">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <Button className="w-full">Sign In</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
