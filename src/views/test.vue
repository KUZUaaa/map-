<template>
<div>
          <svg>
                    <defs>
                              <filter id="MyFilter">
                                        <!-- <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" /> -->
                                        <feColorMatrix      in="sourceGraphic"
                                                            type="saturate"
                                                            values="0"  result="blur"></feColorMatrix>
                                        <feColorMatrix
                                                            in="blur"
                                                            type="matrix"
                                                            values="  1 0 0 0 0
                                                                      0 1 1 1 1
                                                                      1 0 0 0 0
                                                                      0 0 0 1 0" result="blur2"/>
                                        <feGaussianBlur in="blur2" stdDeviation="5" result="blur3" /> 
                                        <feOffset in="blur3" dx="15" dy="15" result="offsetBlur" />
                                        <feMerge>
                                                    <feMergeNode in="offsetBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                   
                                        </feMerge>
                              </filter>
                    </defs>
                    
          </svg>
          <div class="logo" :style="`background-image:url(${img});`" filter="url(#MyFilter)"></div>
</div>
</template>

<script>
import img from '@/assets/logo.png'
export default {
          data(){
                    return {
                              img,
                    }
          }
}
</script>

<style lang="less">
.logo{
          width: 200px;
          height: 200px;
          object-fit:contain;
          filter: url(#MyFilter);
}
</style>