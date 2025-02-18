import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Play, Shuffle } from 'lucide-react';
import Header from './Header';

const ALGORITHMS = {
  selection: "Tri par sélection",
  bubble: "Tri à bulles",
  quick: "Tri rapide",
  merge: "Tri fusion"
};

// Composant pour un élément du tableau avec des animations améliorées
const ArrayElement = ({ 
  value, 
  index, 
  position, 
  isComparing, 
  isSwapping,
  totalElements 
}) => {
  // Calcul de la position relative basée sur l'index
  const calculatePosition = () => {
    const elementWidth = 64; // Largeur de l'élément
    const gap = 16; // Espace entre les éléments
    const totalWidth = (elementWidth + gap) * totalElements;
    const startX = -(totalWidth / 2) + (elementWidth / 2);
    
    return {
      x: startX + (index * (elementWidth + gap)),
      y: 0
    };
  };

  const pos = calculatePosition();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: pos.x,
        y: pos.y,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={`
        absolute w-16 h-16 
        flex flex-col items-center justify-center
        rounded-lg shadow-lg
        ${isComparing ? 'bg-yellow-100 border-2 border-yellow-400' : 
          isSwapping ? 'bg-green-100 border-2 border-green-400' : 
          'bg-white border border-gray-200'}
        transition-colors duration-200
      `}
    >
      <span className="text-lg font-semibold">{value}</span>
      <span className="absolute -bottom-6 text-xs text-gray-500">Index: {index}</span>
    </motion.div>
  );
};

const App = () => {
  const [arrayData, setArrayData] = useState([]);
  const [size, setSize] = useState(10);
  const [algorithm, setAlgorithm] = useState('selection');
  const [speed, setSpeed] = useState(50);
  const [isSorting, setIsSorting] = useState(false);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);

  // Génération améliorée du tableau avec identifiants uniques
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: size }, (_, index) => ({
      id: `element-${index}-${Date.now()}`,
      value: Math.floor(Math.random() * 99) + 1,
      index
    }));
    setArrayData(newArray);
  }, [size]);

  useEffect(() => {
    generateArray();
  }, [size, generateArray]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fonction de swap améliorée avec animation
  const swap = async (arr, i, j) => {
    setSwappingIndices([i, j]);
    
    const newArr = [...arr];
    const temp = { ...newArr[i], index: j };
    newArr[i] = { ...newArr[j], index: i };
    newArr[j] = temp;
    
    setArrayData(newArr);
    await sleep(300 - speed);
    setSwappingIndices([]);
    
    return newArr;
  };

  const compare = async (i, j) => {
    setComparingIndices([i, j]);
    await sleep(300 - speed);
    return arrayData[i].value > arrayData[j].value;
  };

  const bubbleSort = async () => {
    let arr = [...arrayData];
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (await compare(j, j + 1)) {
          arr = await swap(arr, j, j + 1);
        }
      }
    }
    
    setComparingIndices([]);
    return arr;
  };

  const selectionSort = async () => {
    let arr = [...arrayData];
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        setComparingIndices([minIdx, j]);
        await sleep(300 - speed);
        
        if (arr[j].value < arr[minIdx].value) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        arr = await swap(arr, i, minIdx);
      }
    }
    
    setComparingIndices([]);
    return arr;
  };

  const quickSort = async (arr, start, end) => {
    if (start >= end) return arr;

    const partition = async (arr, start, end) => {
      const pivotValue = arr[end].value;
      let i = start - 1;

      for (let j = start; j < end; j++) {
        setComparingIndices([j, end]);
        await sleep(300 - speed);

        if (arr[j].value <= pivotValue) {
          i++;
          if (i !== j) {
            arr = await swap(arr, i, j);
          }
        }
      }

      if (i + 1 !== end) {
        arr = await swap(arr, i + 1, end);
      }

      return i + 1;
    };

    const pivotIndex = await partition(arr, start, end);
    
    // Récursion sur les sous-tableaux
    const leftArr = await quickSort(arr, start, pivotIndex - 1);
    const rightArr = await quickSort(leftArr, pivotIndex + 1, end);

    return rightArr;
  };

  // Tri fusion adapté
  const mergeSort = async (arr, start, end) => {
    if (start >= end) return arr;

    const mid = Math.floor((start + end) / 2);
    
    // Tri récursif des deux moitiés
    const leftArr = await mergeSort(arr, start, mid);
    const rightArr = await mergeSort(leftArr, mid + 1, end);

    // Fusion
    return await merge(rightArr, start, mid, end);
  };

  const merge = async (arr, start, mid, end) => {
    const merged = [...arr];
    let leftIndex = start;
    let rightIndex = mid + 1;
    let mergeIndex = start;

    while (leftIndex <= mid && rightIndex <= end) {
      setComparingIndices([leftIndex, rightIndex]);
      await sleep(300 - speed);

      if (arr[leftIndex].value <= arr[rightIndex].value) {
        merged[mergeIndex] = {
          ...arr[leftIndex],
          index: mergeIndex
        };
        leftIndex++;
      } else {
        merged[mergeIndex] = {
          ...arr[rightIndex],
          index: mergeIndex
        };
        rightIndex++;
      }
      mergeIndex++;
      setArrayData([...merged]);
    }

    // Copie des éléments restants
    while (leftIndex <= mid) {
      merged[mergeIndex] = {
        ...arr[leftIndex],
        index: mergeIndex
      };
      leftIndex++;
      mergeIndex++;
      setArrayData([...merged]);
      await sleep(300 - speed);
    }

    while (rightIndex <= end) {
      merged[mergeIndex] = {
        ...arr[rightIndex],
        index: mergeIndex
      };
      rightIndex++;
      mergeIndex++;
      setArrayData([...merged]);
      await sleep(300 - speed);
    }

    return merged;
  };

  // Modification de la fonction startSort
  const startSort = async () => {
    setIsSorting(true);
    
    try {
      let sortedArray;
      switch (algorithm) {
        case 'bubble':
          sortedArray = await bubbleSort();
          break;
        case 'selection':
          sortedArray = await selectionSort();
          break;
        case 'quick':
          sortedArray = await quickSort([...arrayData], 0, arrayData.length - 1);
          break;
        case 'merge':
          sortedArray = await mergeSort([...arrayData], 0, arrayData.length - 1);
          break;
      }
      setArrayData(sortedArray);
    } finally {
      setIsSorting(false);
      setComparingIndices([]);
      setSwappingIndices([]);
    }
  };

  return (
    <div className='h-screen bg-gray-100'>
      <Header />
      <Card className="w-full max-w-6xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-6 h-6" />
            Visualiseur d'Algorithmes de Tri Avancé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-4 gap-4">
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isSorting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un algorithme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Taille:</span>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Math.min(13, Math.max(5, parseInt(e.target.value) || 5)))}
                  className="w-20"
                  min="5"
                  max="13"
                  disabled={isSorting}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Vitesse:</span>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={0}
                  max={250}
                  step={10}
                  disabled={isSorting}
                  className="w-32"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateArray}
                  disabled={isSorting}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Mélanger
                </Button>
                
                <Button
                  onClick={startSort}
                  disabled={isSorting}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                >
                  <Play className="w-4 h-4" />
                  Trier
                </Button>
              </div>
            </div>

            <div className="relative h-80 w-full bg-gray-50 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="sync">
                  {arrayData.map((item) => (
                    <ArrayElement
                      key={item.id}
                      value={item.value}
                      index={item.index}
                      position={item.index}
                      isComparing={comparingIndices.includes(item.index)}
                      isSwapping={swappingIndices.includes(item.index)}
                      totalElements={arrayData.length}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  </div>
  );
};

export default App;