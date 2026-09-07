const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
new Function(script);
const context = vm.createContext({ assert, URLSearchParams });
vm.runInContext(script.replace('loadParams(); initControls(); render(); initCollection();', ''), context);
vm.runInContext(`
assert.equal(FOOD_MASTER_100.length,100);
assert.equal(new Set(FOOD_MASTER_100.map(f=>f.id)).size,100);
const ready=FOOD_MASTER_100.filter(f=>f.nutritionReady===true);
const pending=FOOD_MASTER_100.filter(f=>f.nutritionReady===false);
assert.equal(ready.length,21);assert.equal(pending.length,79);
for(const f of ready)assert.ok(collectionNutritionFood(f),f.id);
state.foods=[{key:1,food:ready[0].existingFoodDbId,g:30}];
const baseline=foodAmount('エネルギー').amount;
assert.ok(baseline>0);
for(const f of pending){
  const before=state.foods.length;
  assert.equal(addCollectionFood(f.id),false,f.id);
  assert.equal(state.foods.length,before);
  state.foods.push({key:2,food:f.id,g:100});
  assert.equal(foodAmount('エネルギー').amount,baseline,f.id);
  state.foods.pop();
}
const mapped=ready[0];mapped.nutritionReady=false;
assert.equal(foodAmount('エネルギー').hasData,false);
assert.equal(collectionNutritionFood(mapped),undefined);
mapped.nutritionReady=true;
eatenFoodIds=new Set(FOOD_MASTER_100.map(f=>f.id));
assert.equal(getFoodChallengeProgress(eatenFoodIds).unlocked,100);
assert.equal(foodAmount('エネルギー').amount,baseline);
assert.equal(getFoodChallengeProgress(['bread','bread','invalid']).unlocked,1);
`, context);
assert.ok(html.indexOf('id="foodCollection"') < html.indexOf('</aside>'));
console.log('PASS: 100 unique foods, 21 valid mappings, all 79 excluded, fail-closed mapping and independent collection state');
