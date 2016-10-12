@extends('layouts.master')
@section('content')
<div class="container-fluid">
	<div class="table-responsive">
		<table class="table table-hover">
			<thead>
				<tr>
					<td>ID</td>
					<td>Cliente</td>
					<td>Conductor asignado</td>
					<td>Distancia a recorrer</td>
				</tr>
			</thead>
			<tbody id="tabla"></tbody>
		</table>
	</div>
</div>
	<div id="map_container">
		<div id="map"></div>
	</div>
</div>

<!-- Modal configuración de conductores y clientes -->
<div class="modal fade" tabindex="-1" role="dialog" id="modal-num_drivers_customers">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Configuración de conductores y clientes</h4>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="form-group">
						<label for="" class="col-lg-12 col-md-12 col-sm-12 col-xs-12">Ingresa el número de conductores y clientes que intervendrán en la aplicación</label>
						<input type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 numeric" id="num_drivers" placeholder="">
					</div>
				</div>
				<!--
				<div class="row">
					<div class="form-group">
						<label for="" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 center-block">Ingresa el número de clientes</label>
						<input type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" id="num_customers" placeholder="">
					</div>
				</div>
				-->
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
				<button type="button" class="btn btn-primary" id="guardar_configuracion">Guardar</button>
			</div>
		</div>
	</div>
</div>

<!-- Modal de alerta -->
<div class="modal fade" id="modal_alerta" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h3>¡Campos requeridos!</h3>
			</div>
			<div class="modal-body">
				<h4 id="texto_alerta">Por favor ingresa el número de conductores y clientes que intervendrán en la aplicación</h4>
			</div>
			<div class="modal-footer">
				<a href="#" data-dismiss="modal" class="btn btn-danger">Cerrar</a>
			</div>
		</div>
	</div>
</div>
@endsection