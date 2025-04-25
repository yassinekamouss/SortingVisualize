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

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 640,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Composant pour un élément du tableau avec des animations améliorées
const ArrayElement = ({ value, index, position, isComparing, isSwapping, totalElements }) => {
  const { width } = useWindowSize();
  
  const calculatePosition = () => {
    const elementWidth = width < 640 ? 32 : 64;
    const gap = width < 640 ? 4 : 16;
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
        absolute w-8 h-8 sm:w-16 sm:h-16 
        flex flex-col items-center justify-center
        rounded-lg shadow-lg
        ${isComparing ? 'bg-yellow-100 border-2 border-yellow-400' : 
          isSwapping ? 'bg-green-100 border-2 border-green-400' : 
          'bg-white border border-gray-200'}
        transition-colors duration-200
      `}
    >
      <span className="text-xs sm:text-lg font-semibold">{value}</span>
      <span className="absolute -bottom-3 sm:-bottom-6 text-[8px] sm:text-xs text-gray-500">Index: {index}</span>
    </motion.div>
  );
};

const App = () => {

  const { width } = useWindowSize();
  const initialSize = width < 640 ? 5 : 10;
  const [arrayData, setArrayData] = useState([]);
  // const [size, setSize] = useState(initialSize);
  const [size, setSize] = useState(window.innerWidth < 640 ? 5 : 10);
  const [algorithm, setAlgorithm] = useState('selection');
  const [speed, setSpeed] = useState(50);
  const [isSorting, setIsSorting] = useState(false);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);

  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: size }, (_, index) => ({
      id: `element-${index}-${Date.now()}`,
      value: Math.floor(Math.random() * 99) + 1,
      index
    }));
    setArrayData(newArray);
  }, [size]);

  useEffect(() => {
    if (width < 640 && size > 5) {
      setSize(5);
    }
  }, [width, size]);

  useEffect(() => {
    if (arrayData.length === 0) {
      generateArray();
    }
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Nouvelle fonction pour visualiser la comparaison
  const visualizeCompare = async (i, j) => {
    setComparingIndices([i, j]);
    await sleep(300 - speed);
    setComparingIndices([]);
  };

  // Fonction de swap améliorée avec animation
  const swap = async (arr, i, j) => {
    setSwappingIndices([i, j]);
    await sleep(300 - speed);
    
    const newArr = [...arr];
    const tempId = newArr[i].id;
    const tempValue = newArr[i].value;
    
    newArr[i] = {
      id: newArr[j].id,
      value: newArr[j].value,
      index: i
    };
    
    newArr[j] = {
      id: tempId,
      value: tempValue,
      index: j
    };
    
    setArrayData(newArr);
    setSwappingIndices([]);
    
    return newArr;
  };
  
  // Tri à bulles corrigé
  const bubbleSort = async () => {
    let arr = [...arrayData];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      let hasSwapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        await visualizeCompare(j, j + 1);
        
        if (arr[j].value > arr[j + 1].value) {
          arr = await swap(arr, j, j + 1);
          hasSwapped = true;
        }
      }
      
      if (!hasSwapped) break;
    }
    
    return arr;
  };
  
  // Tri rapide corrigé
  const quickSort = async (arr, low, high) => {
    const stack = [{low, high}];
    
    while (stack.length > 0) {
      const {low, high} = stack.pop();
      
      if (low < high) {
        const pivot = arr[high].value;
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          await visualizeCompare(j, high);
          
          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              arr = await swap(arr, i, j);
            }
          }
        }
        
        const pivotIndex = i + 1;
        if (pivotIndex !== high) {
          arr = await swap(arr, pivotIndex, high);
        }
        
        // Ajout des sous-tableaux à la pile
        if (pivotIndex - 1 > low) {
          stack.push({low, high: pivotIndex - 1});
        }
        if (pivotIndex + 1 < high) {
          stack.push({low: pivotIndex + 1, high});
        }
      }
    }
    
    return arr;
  };

  const compare = async (i, j) => {
    setComparingIndices([i, j]);
    await sleep(300 - speed);
    return arrayData[i].value > arrayData[j].value;
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
      const arr = [...arrayData];
      
      switch (algorithm) {
        case 'bubble':
          sortedArray = await bubbleSort();
          break;
        case 'selection':
          sortedArray = await selectionSort();
          break;
        case 'quick':
          sortedArray = await quickSort(arr, 0, arr.length - 1);
          break;
        case 'merge':
          sortedArray = await mergeSort(arr, 0, arr.length - 1);
          break;
        default:
          sortedArray = arr;
      }
      
      setArrayData(sortedArray);
    } finally {
      setIsSorting(false);
      setComparingIndices([]);
      setSwappingIndices([]);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <Card className="w-[95%] max-w-6xl mx-auto mt-4 sm:mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" />
            Visualiseur d'Algorithmes de Tri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isSorting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
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
                <span className="text-xs sm:text-sm text-gray-500">Taille:</span>
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
                <span className="text-xs sm:text-sm text-gray-500">Vitesse:</span>
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
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-sm"
                >
                  <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
                  Mélanger
                </Button>
                
                <Button
                  onClick={startSort}
                  disabled={isSorting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-sm bg-green-500 hover:bg-green-600"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  Trier
                </Button>
              </div>
            </div>

            <div className="relative h-60 sm:h-80 w-full bg-gray-50 rounded-xl overflow-hidden">
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
}

export default App;