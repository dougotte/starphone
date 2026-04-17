type Brand = {
  name: string;
  icon: string;
  color?: string;
};

type BrandFilterProps = {
  brands: Brand[];
  selectedBrand: string | null;
  onSelectBrand: (brand: string | null) => void;
  selectedTipo?: string | null;
  onSelectTipo?: (tipo: string | null) => void;
};

const tiposBase = ['TELA', 'BATERIA', 'DOCK DE CARGA', 'TAMPA TRASEIRA', 'PERIFÉRICOS'];

export function getTiposForBrand(brand: string | null): string[] {
  if (brand === 'iPhone') return [...tiposBase, 'CÂMERA'];
  return tiposBase;
}

export default function BrandFilter({ brands, selectedBrand, onSelectBrand, selectedTipo, onSelectTipo }: BrandFilterProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-fit sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Marcas</h2>
      <div className="space-y-3">
        {brands.map((brand) => (
          <div key={brand.name} className="space-y-2">
            <button
              onClick={() => {
                onSelectBrand(brand.name);
                onSelectTipo?.(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                selectedBrand === brand.name
                  ? 'ring-2 ring-[#00ff00]'
                  : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: brand.color || '#f3f4f6',
                color: brand.color ? '#fff' : '#374151'
              }}
            >
              <span className="text-lg mr-2">{brand.icon}</span>
              {brand.name}
            </button>

            {selectedBrand === brand.name && onSelectTipo && (
              <div className="pl-4 space-y-1">
                {getTiposForBrand(brand.name).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => onSelectTipo(tipo)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition text-sm ${
                      selectedTipo === tipo
                        ? 'text-white ring-2 ring-[#00ff00]'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    style={{
                      backgroundColor: selectedTipo === tipo
                        ? brand.color || '#000'
                        : undefined
                    }}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
