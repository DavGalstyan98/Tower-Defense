/**
 * Tower information and upgrade panel
 */

import React from 'react';
import { useSelectedTower, useTowers, useGameStore, useMoney } from '../state/store';
import { TOWER_DEFINITIONS } from '../engine/constants';
import { calculateTowerDPS, canUpgradeTower, getTowerUpgradeCost } from '../engine/effects';

export const TowerInfo: React.FC = () => {
  const selectedTowerId = useSelectedTower();
  const towers = useTowers();
  const money = useMoney();
  const deselectTower = useGameStore(state => state.deselectTower);

  const selectedTower = towers.find(t => t.id === selectedTowerId);

  if (!selectedTower) {
    return null;
  }

  const towerDef = TOWER_DEFINITIONS[selectedTower.kind];
  const canUpgrade = canUpgradeTower(selectedTower);
  const upgradeCost = getTowerUpgradeCost(selectedTower);
  const canAffordUpgrade = money >= upgradeCost;
  const currentDPS = calculateTowerDPS(selectedTower);

  const handleUpgrade = () => {
    if (canUpgrade && canAffordUpgrade) {
      // This would be implemented in the store
      console.log('Upgrade tower:', selectedTower.id);
    }
  };

  const handleSell = () => {
    // This would be implemented in the store
    console.log('Sell tower:', selectedTower.id);
    deselectTower();
  };

  const getTowerIcon = (towerType: string) => {
    switch (towerType) {
      case 'arrow':
        return '🏹';
      case 'cannon':
        return '💣';
      case 'frost':
        return '❄️';
      default:
        return '🏗️';
    }
  };

  const getTowerColor = (towerType: string) => {
    switch (towerType) {
      case 'arrow':
        return 'text-green-400';
      case 'cannon':
        return 'text-orange-400';
      case 'frost':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="absolute top-20 right-4 z-10">
      <div className="bg-game-ui/90 backdrop-blur-sm rounded-lg p-6 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getTowerIcon(selectedTower.kind)}</div>
            <div>
              <h3 className={`text-lg font-bold ${getTowerColor(selectedTower.kind)}`}>
                {towerDef.name}
              </h3>
              <p className="text-sm text-gray-400">Tier {selectedTower.tier}</p>
            </div>
          </div>
          <button
            onClick={deselectTower}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close tower info"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-300">Damage:</span>
            <span className="text-white font-semibold">{selectedTower.damage}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">Range:</span>
            <span className="text-white font-semibold">{selectedTower.range.toFixed(1)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">Rate:</span>
            <span className="text-white font-semibold">{selectedTower.rate.toFixed(1)}/s</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">DPS:</span>
            <span className="text-yellow-400 font-semibold">{currentDPS.toFixed(1)}</span>
          </div>

          {selectedTower.splashRadius && (
            <div className="flex justify-between">
              <span className="text-gray-300">Splash:</span>
              <span className="text-white font-semibold">{selectedTower.splashRadius.toFixed(1)}</span>
            </div>
          )}

          {selectedTower.slowDuration && (
            <div className="flex justify-between">
              <span className="text-gray-300">Slow:</span>
              <span className="text-white font-semibold">
                {((1 - (selectedTower.slowAmount || 0)) * 100).toFixed(0)}% for {selectedTower.slowDuration}s
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {canUpgrade && (
            <button
              onClick={handleUpgrade}
              disabled={!canAffordUpgrade}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-colors
                ${canAffordUpgrade
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label={`Upgrade tower for $${upgradeCost}`}
            >
              Upgrade (${upgradeCost})
            </button>
          )}

          <button
            onClick={handleSell}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            aria-label="Sell tower"
          >
            Sell (${Math.floor(selectedTower.cost * 0.7)})
          </button>
        </div>

        {/* Upgrade preview */}
        {canUpgrade && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Next Upgrade:</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Damage:</span>
                <span className="text-green-400">
                  {selectedTower.damage} → {Math.floor(selectedTower.damage * 1.5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Range:</span>
                <span className="text-green-400">
                  {selectedTower.range.toFixed(1)} → {(selectedTower.range * 1.2).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span className="text-green-400">
                  {selectedTower.rate.toFixed(1)} → {(selectedTower.rate * 1.1).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
