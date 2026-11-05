(function (root) {
  'use strict';
  // Engine arms run from the spinner outwards. Screen order is opposite above it.
  function armTiles(tiles, arm) {
    const ordered = arm === 2 ? tiles.slice().reverse() : tiles;
    return ordered.map(tile => arm === 0 || arm === 2 ? { ...tile, a: tile.b, b: tile.a } : { ...tile });
  }
  function isVertical(tile, arm) {
    const double = tile.a === tile.b;
    return arm > 1 ? !double : double;
  }
  function layout(board) {
    const gap=4, length=72, thickness=38;
    const rootVertical=board.spinner;
    const rootWidth=rootVertical?thickness:length, rootHeight=rootVertical?length:thickness;
    const placed=[{tile:{...board.root},x:-rootWidth/2,y:-rootHeight/2,width:rootWidth,height:rootHeight,vertical:rootVertical,arm:null}];
    const directions=[[-1,0],[1,0],[0,-1],[0,1]];
    const bends=[[0,1],[0,-1],[-1,0],[1,0]];
    board.arms.forEach((tiles,arm)=>{
      let direction=directions[arm],previous=placed[0],segment=0,leg=0;
      for(const tile of tiles) {
        const threshold=direction[0]?216:144;
        const turning=segment>=threshold;
        if(turning){leg++;direction=leg%2?bends[arm]:directions[arm];segment=0;}
        const [dx,dy]=direction, double=tile.a===tile.b;
        const vertical=dy!==0?!double:double;
        const width=vertical?thickness:length,height=vertical?length:thickness;
        const along=dx?width:height;
        let anchorX=previous.x+previous.width/2,anchorY=previous.y+previous.height/2;
        if(turning){
          const oldDirection=leg%2?directions[arm]:bends[arm];
          const oldAlong=oldDirection[0]?previous.width:previous.height;
          const offset=previous.tile.a===previous.tile.b?0:oldAlong/4;
          anchorX+=oldDirection[0]*offset;anchorY+=oldDirection[1]*offset;
        }
        anchorX+=dx*(previous.width/2+gap);anchorY+=dy*(previous.height/2+gap);
        const displayed=dx<0||dy<0?{...tile,a:tile.b,b:tile.a}:{...tile};
        const next={tile:displayed,x:anchorX+dx*along/2-width/2,y:anchorY+dy*along/2-height/2,width,height,vertical,arm,direction:[dx,dy]};
        placed.push(next);previous=next;segment+=along+gap;
      }
    });
    const minX=Math.min(...placed.map(p=>p.x)),minY=Math.min(...placed.map(p=>p.y));
    const maxX=Math.max(...placed.map(p=>p.x+p.width)),maxY=Math.max(...placed.map(p=>p.y+p.height));
    return {width:maxX-minX+16,height:maxY-minY+16,tiles:placed.map(p=>({...p,x:p.x-minX+8,y:p.y-minY+8}))};
  }
  function fitScale(width,height,tableWidth,tableHeight) {
    return Math.min(tableWidth<=640?.8:1,Math.max(1,tableWidth-32)/Math.max(1,width),Math.max(1,tableHeight-32)/Math.max(1,height));
  }
  const api = { armTiles, isVertical, layout, fitScale };
  if (typeof module !== 'undefined') module.exports = api;
  root.DominoBoardView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
