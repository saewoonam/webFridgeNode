<script>
  import { onMount } from 'svelte';
  import { beforeUpdate, afterUpdate } from 'svelte';
  let plotDiv;
  let plot;
  afterUpdate( ()=> {
    //if(plot) plot.setData(data);
    if (plot) plot.redraw(plot);
  })

  onMount(() => {
    // console.log("onMount")
    plotDiv = document.getElementById('plotDiv'); 
    // console.log(plotDiv)
    plot = new uPlot(opts,data,plotDiv); 
  })
  function legendAsTooltipPlugin({ className, style = { backgroundColor:"rgba(255, 249, 196, 0.92)", color: "black" } } = {}) {
        let legendEl;

        function init(u, opts) {
          legendEl = u.root.querySelector(".u-legend");

          legendEl.classList.remove("u-inline");
          className && legendEl.classList.add(className);

          console.log(legendEl)

          uPlot.assign(legendEl.style, {
            textAlign: "left",
            pointerEvents: "none",
            display: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 100,
            boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
            ...style
          });

          // hide series color markers
          const idents = legendEl.querySelectorAll(".u-marker");

          for (let i = 0; i < idents.length; i++)
            idents[i].style.display = "none";

          const overEl = u.root.querySelector(".u-over");
          overEl.style.overflow = "visible";

          // move legend into plot bounds
          overEl.appendChild(legendEl);

          // show/hide tooltip on enter/exit
          overEl.addEventListener("mouseenter", () => {legendEl.style.display = null;});
          overEl.addEventListener("mouseleave", () => {legendEl.style.display = "none";});

          // let tooltip exit plot
        //  overEl.style.overflow = "visible";
        }

        function update(u) {
          const { left, top } = u.cursor;
          legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
        }

        return {
          hooks: {
            init: init,
            setCursor: update,
          }
        };
  }


  export let data = [
    [1546300800, 1546387200],    // x-values (timestamps)
    [        35,         71],    // y-values (series 1)
    [        90,         15],    // y-values (series 2)
  ];
  // console.log('initial data', data);
  export let opts = {
    title: "My Chart",
    width: 600,
    height: 400,
    /* plugins: [ */
    /*   legendAsTooltipPlugin(), */
    /* ], */
    /*
    scales: {
        x:{
          auto: true,
        },
        y: {
          auto: true,
        }
      },
     */
    series: [
      {},
      {
        spanGaps: true,
        label: "y1",
        stroke: "red",
        width: 1,
        dash: [10, 5],
      },
      {
        spanGaps: true,
        label: "y2",
        stroke: "blue",
        width: 1,
      },
      {
        spanGaps: true,
        label: "y3",
        stroke: "green",
        width: 1,
      }
    ],
  }
</script>

<div id="plotDiv"><!-- uplot chart will be drawn inside this DIV --></div>


