<script>
  export let title='temperature table'
  export let table_data = {
    '1k': 4.978491,
    '4k': 3.070931,
    pump: 6.659844,
    switch: 17.41950,
    hp: 0.000000,
    hs: 4.000000,
    relays: 0,
  }
  let table_array = []
  for (let key in table_data) {
    let value = Number.isInteger(table_data[key]) ? table_data[key] : table_data[key].toFixed(2)
    table_array.push({name: key, value:value})
  }
</script>
<style>
  td {
    background-color: #E2E2E2;
    padding: 0.5em;
  }
</style>
<h4>
  {title}
</h4>
<table>
  <tbody>
    {#each table_array as row}
    <tr>
      <td>{row.name}&nbsp&nbsp </td>
      <td>&nbsp&nbsp{row.value}</td>
    </tr>
    {/each}
  </tbody>
</table>
