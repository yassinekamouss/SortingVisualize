import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from './Header';

const App = () => {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(25);
  const [algorithm, setAlgorithm] = useState('selection');
  const [order, setOrder] = useState('asc');
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndices, setCurrentIndices] = useState([-1, -1]);

  // Générer un nouveau tableau
  const generateArray = () => {
    const newArray = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
  };

  useEffect(() => {
    generateArray();
  }, [size]);

  // Fonction utilitaire pour l'animation
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Tri par sélection
  const selectionSort = async () => {
    let arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        setCurrentIndices([i, j]);
        await sleep(100);
        if ((order === 'asc' && arr[j] < arr[minIdx]) || 
            (order === 'desc' && arr[j] > arr[minIdx])) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
      }
    }
    setCurrentIndices([-1, -1]);
    return arr;
  };

  // Tri à bulles
  const bubbleSort = async () => {
    let arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setCurrentIndices([j, j + 1]);
        await sleep(100);
        if ((order === 'asc' && arr[j] > arr[j + 1]) ||
            (order === 'desc' && arr[j] < arr[j + 1])) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
      }
    }
    setCurrentIndices([-1, -1]);
    return arr;
  };

  // Tri rapide
  const quickSort = async (arr, start, end) => {
    if (start >= end) return;

    const partition = async (arr, start, end) => {
      const pivot = arr[end];
      let i = start - 1;

      for (let j = start; j < end; j++) {
        setCurrentIndices([j, end]);
        await sleep(100);
        if ((order === 'asc' && arr[j] <= pivot) ||
            (order === 'desc' && arr[j] >= pivot)) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
        }
      }
      [arr[i + 1], arr[end]] = [arr[end], arr[i + 1]];
      setArray([...arr]);
      return i + 1;
    };

    const pi = await partition(arr, start, end);
    await quickSort(arr, start, pi - 1);
    await quickSort(arr, pi + 1, end);
  };

  // Tri fusion
  const mergeSort = async (arr, start, end) => {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);
    await mergeSort(arr, start, mid);
    await mergeSort(arr, mid + 1, end);

    const merge = async (arr, start, mid, end) => {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        setCurrentIndices([start + i, mid + 1 + j]);
        await sleep(100);
        if ((order === 'asc' && left[i] <= right[j]) ||
            (order === 'desc' && left[i] >= right[j])) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        k++;
        setArray([...arr]);
      }

      while (i < left.length) {
        arr[k] = left[i];
        i++;
        k++;
        setArray([...arr]);
        await sleep(100);
      }

      while (j < right.length) {
        arr[k] = right[j];
        j++;
        k++;
        setArray([...arr]);
        await sleep(100);
      }
    };

    await merge(arr, start, mid, end);
  };

  // Tri topologique
  const topologicalSort = async () => {
    // Pour cet exemple, nous allons simuler un tri topologique
    // en utilisant une version modifiée du tri par insertion
    let arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let current = arr[i];
      let j = i - 1;
      
      while (j >= 0 && 
             ((order === 'asc' && arr[j] > current) ||
              (order === 'desc' && arr[j] < current))) {
        setCurrentIndices([j, j + 1]);
        await sleep(100);
        arr[j + 1] = arr[j];
        j--;
        setArray([...arr]);
      }
      arr[j + 1] = current;
      setArray([...arr]);
    }
    setCurrentIndices([-1, -1]);
    return arr;
  };

  const startSort = async () => {
    setIsSorting(true);
    const arr = [...array];
    
    switch (algorithm) {
      case 'selection':
        await selectionSort();
        break;
      case 'bubble':
        await bubbleSort();
        break;
      case 'quick':
        await quickSort(arr, 0, arr.length - 1);
        break;
      case 'merge':
        await mergeSort(arr, 0, arr.length - 1);
        break;
      case 'topological':
        await topologicalSort();
        break;
    }
    
    setIsSorting(false);
  };

  return (
    <>
      <Header />
      <Card className="w-full max-w-5xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Visualisateur d'Algorithmes de Tri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className='flex gap-4'>
              <select 
                className="p-2 border rounded"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isSorting}
              >
                <option value="selection">Tri par sélection</option>
                <option value="bubble">Tri à bulles</option>
                <option value="quick">Tri rapide</option>
                <option value="merge">Tri fusion</option>
                <option value="topological">Tri topologique</option>
              </select>
              
              <select 
                className="p-2 border rounded"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                disabled={isSorting}
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </select>
              
              <input 
                type="number"
                className="p-2 border rounded w-24"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                min="5"
                max="50"
                disabled={isSorting}
              />
            </div>

            
            <div className='flex gap-4'>
              <Button 
                onClick={generateArray}
                disabled={isSorting}
                className="bg-black text-white"
              >
                Nouveau Tableau
              </Button>
              
              <Button 
                onClick={startSort}
                disabled={isSorting}
                className="bg-green-500 text-white"
              >
                Démarrer le Tri
              </Button>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-center gap-1 mt-4">
            {array.map((value, idx) => (
              <div
                key={idx}
                className="w-8 bg-blue-500 transition-all duration-100"
                style={{
                  height: `${value}%`,
                  backgroundColor: currentIndices.includes(idx) ? '#ef4444' : '#3b82f6'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default App;