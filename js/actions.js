// Tiny event-delegation registry. Markup declares data-action="name" (click)
// or data-change="name" (change); modules register handlers by name.
// Handlers receive (dataset, element, event).
const clickActions={},changeActions={};
export function onAction(map){Object.assign(clickActions,map);}
export function onChange(map){Object.assign(changeActions,map);}
export function runAction(name,data={}){const fn=clickActions[name];if(fn)fn(data,null,null);}
export function installDelegation(root=document){
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');
    if(!el)return;
    const fn=clickActions[el.dataset.action];
    if(fn){e.preventDefault();fn(el.dataset,el,e);}
  });
  root.addEventListener('change',e=>{
    const el=e.target.closest('[data-change]');
    if(!el)return;
    const fn=changeActions[el.dataset.change];
    if(fn)fn(el.dataset,el,e);
  });
}
