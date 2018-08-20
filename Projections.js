class AbstractSource {
	isModified() {
		return this.modified;
	}

	getOutput() {
		return this.output;
	}

	setModified(modified) {
		this.modified = modified;
	}
}

class AbstractFilter extends AbstractSource {
	constructor() {
		super();
	}

	getInput() {
		return this.input;
	}

	setInput(input) {
		this.input = input;
		this.setModified(true);
	}

	execute() {
		this.checkInput();
		if (this.isModified()) {
			this.run();
			this.setModified(false);
		}
	}

	checkInput() {
		if (this.input == null) {
			alert("Input is null");
		}
	}
}

class Projection extends AbstractFilter {
	constructor(dimension) {
		super();
		if (dimension < 2 || dimension > 3)
			alert("Bad dimension");
		this.dimension = dimension;
	}

	setInput(input) {
		this.length = input.matriz.numLinhas;
		this.dataDimension = input.matriz.numDimensoes;
		super.setInput(input.matriz);
	}

	setDissimilarity(dissimilarity) {
		this.dissimilarity = dissimilarity;
	}

	run() {
		var y = (this.length == 1);

		if (y) {
			y = this.zeros();
		} else {
			y = this.project();
		}

		y.ids = this.input.ids;
		y.labels = this.input.labels;
		this.output = y;
	}

	project() {
		return zeros();
	}

	zeros() {
		return constroiMatriz(null, this.length, this.dimension);
	}
}

class Sampler extends AbstractFilter {
	constructor() {
		super();
		this.sampleSize = 1;
	}

	setSampleSize(sampleSize) {
		this.sampleSize = Math.max(1, sampleSize);
	}

	run () {
		var b = (this.input.length <= this.sampleSize);
		if (b) {
			this.output = this.input;
		} else {
			this.output = this.sample();
		}
	}

	sample() {
		return this.input;
	}
}

class DenseVector {
	constructor(vector) {
		this.values = vector;
		this.size = vector.length;
		this.id = 0;
		this.klass = 0.0;
		this.updateNorm = true;
		this.norm = 0.0;
	}

	updateNorma() {
		this.norm = 0.0;

		var length = this.values.length;
		for (var i = 0; i < length; i++) {
			var quadrado = parseFloat(this.values[i]) * parseFloat(this.values[i]);
			this.norm += quadrado;
		}

		this.norm = Math.sqrt(this.norm);
		this.updateNorm = false;
	}

	getNorm() {
		if (this.updateNorm) {
			this.updateNorma();
		}

		return this.norm;
	}

	dot(vector) {
		var dot = 0.0;
		var length = this.values.length;
		for (var i = 0; i < length; i++) {
			dot += this.values[i] * vector.values[i];
		}

		return dot;
	}
}

class Euclidean {
	compute(x, y) {
		var n1 = x.getNorm();
		var n2 = y.getNorm();
		var dot = x.dot(y);
		var aux = Math.abs(n1 * n1 + n2 * n2 - 2 * dot);
		aux = Math.sqrt(aux);
		aux = parseFloat(aux);

		return aux;
	}
}

class Pivot {
	constructor(distance, id) {
		this.distance = distance;
		this.id = id;
	}
}

class BKMeans {
	constructor(nrclusters) {
		this.nrclusters = nrclusters;
		this.nrIteractions = 15;
	}

	setClusters(clusters) {
		this.clusters.push(clusters);
	}

	execute(matrix) {

		//TODO: medir tempo inicial

		this.clusters = new Array();
		this.diss = new Euclidean();
		this.centroids = new Array();
		var gCluster = new Array();

		var size1 = matrix.length;
		for (var i = 0; i < size1; i++) {
			gCluster[i] = i;
		}

		this.clusters.push(gCluster);
		this.centroids.push(matrix[0]);

		for (var j = 0; j < this.nrclusters - 1; j++) {
			var aux = this.clusters.slice();
			gCluster = this.getClusterToSplit(aux.slice());

			if (gCluster.length > 1) {
				this.splitCluster(matrix, this.diss, gCluster);
			}
		}

		for (var i = this.clusters.length - 1; i >= 0; i--) {
			if (this.clusters[i].length <= 0) {
				this.clusters.splice(i, 1);
			}
		}

		var removed = 0;
		for (var i = this.clusters.length - 1; i >= 0; i--) {
			if (this.clusters[i].length == 0) {
				this.clusters.splice(i, 1);
				this.centroids.splice(i, 1);
				removed++;
			}
		}

		// medir tempo final

		return this.clusters;
	}

	getClusterToSplit(clusters) {	
		var gCluster = new Array();
		var teste = new Array();
		teste = clusters[0];
		gCluster = teste.slice();

		for (var i = 0; i < clusters.length; i++) {
			if (clusters[i].length > gCluster.length) {
				gCluster = clusters[i];
			}
		}

		return gCluster;
	}
	
	splitCluster(matrix, diss, gCluster) {
		var index = undefined;
		for (var i = 0; i < this.clusters.length; i++) {
			if (this.clusters[i].length == gCluster.length) {
				for (var j = 0; j < gCluster.length; j++) {
					if (this.clusters[i][j] == gCluster[j]) {
						index = i;
					}
					else {
						index = -1;
					}
				}
				i = this.clusters.length;
			}
		}

		this.centroids.splice(index, 1);
		this.clusters.splice(index, 1);

		var pivots = this.getPivots(matrix, diss, gCluster.slice());
		
		var cluster_1 = new Array();
		var centroid_1 = new Array();
		cluster_1.push(pivots[0]);
		centroid_1 = matrix[pivots[0]];
		centroid_1.updateNorm = true;

		var cluster_2 = new Array();
		var centroid_2 = new Array();
		cluster_2.push(pivots[1]);
		centroid_2 = matrix[pivots[1]];
		centroid_2.updateNorm = true;

		var iterations = 0;
		do {
			centroid_1 = this.calculateMean(matrix, cluster_1.slice());
			centroid_2 = this.calculateMean(matrix, cluster_2.slice());

			while (cluster_1.length > 0) {
				cluster_1.pop();
			}
			while(cluster_2.length > 0) {
				cluster_2.pop();
			}

			var size = gCluster.length;
			var k = gCluster.slice();
			for (var i = 0; i < size; i++) {
				var distCentr_1 = diss.compute(matrix[k[i]], centroid_1);
				var distCentr_2 = diss.compute(matrix[k[i]], centroid_2);

				if (distCentr_1 < distCentr_2) {
					cluster_1.push(k[i]);
				}
				else if (distCentr_2 < distCentr_1) {
					cluster_2.push(k[i]);
				}
				else {
					if (cluster_1.length > cluster_2.length) {
						cluster_2.push(k[i]);
					}
					else {
						cluster_1.push(k[i]);
					}
				}
			}

			if (cluster_1.length < 1) {
				cluster_1.push(cluster_2[0]);
				cluster_2.shift()
			}
			else if (cluster_2.length < 1) {
				cluster_2.push(cluster_1[0]);
				cluster_1.shift();
			}

		} while (++iterations < this.nrIteractions);

		// Adicionar clusters
		this.clusters.push(cluster_1);
		this.clusters.push(cluster_2);

		// Adicionar centroids
		this.centroids.push(centroid_1);
		this.centroids.push(centroid_2);
	}

	getPivots(matrix, diss, gCluster) {
		var pivots = new Array();
		var pivots_aux = new Array();

		var mean = this.calculateMean(matrix, gCluster);

		var size = Math.floor(1 + (gCluster.length / 10));
		for (var i = 0; i < size; i++) {
			var el = Math.floor((gCluster.length / size) * i);
			var aux = gCluster[el];
			var distance = diss.compute(mean, matrix[aux]);
			pivots_aux.push(new Pivot(distance, aux));
		}

		// Valores corretos até certa precisão
		pivots_aux.sort(function(a, b) {
			return a.distance - b.distance;
		});

		pivots[0] = pivots_aux[Math.floor(pivots_aux.length * 0.75)].id;

		pivots_aux.length = 0;	// clear()

		for (var i = 0; i < size; i++) {
			var el = Math.floor((gCluster.length / size) * i);
			var aux = gCluster[el];
			var distance = diss.compute(matrix[pivots[0]], matrix[aux]);
			pivots_aux.push(new Pivot(distance, aux));
		}

		pivots_aux.sort(function(a, b) {
			return a.distance - b.distance;
		});

		pivots[1] = pivots_aux[Math.floor(pivots_aux.length * 0.75)].id;

		return pivots;
	}

	calculateMean(matrix, cluster) {
		var mean = new Array();
		var size = cluster.length;
		for (var i = 0; i < size; i++) {
			mean.push(matrix[cluster[i]]);
		}

		return this.funcMean(mean.slice());
	}

	funcMean(matrix) {
		var numDimensoes = matrix[0].size;
		var mean = new Array();
		var size = matrix.length;

		for (var i = 0; i < numDimensoes; i++) {
			mean[i] = 0.0;
		}

		for (var i = 0; i < size; i++) {
			var values = new Array();
			var tam = matrix[0].values.length;
			for (var j = 0; j < tam; j++) {
				values[j] = matrix[i].values[j];
			}
			
			for (var j = 0; j < values.length; j++)
			 	mean[j] = parseFloat(mean[j]) + parseFloat(values[j]);
		}

		for (var j = 0; j < mean.length; j++) 
			mean[j] = parseFloat(mean[j]) / parseFloat(size);
		
		return new DenseVector(mean);
	}

	getMedoids(matrix) {
		var m = new Array();
		var point;
		for (var i = 0; i < this.centroids.length; i++) {
			point = -1;
			var distance = Number.MAX_VALUE;

			for (var j = 0; j < this.clusters[i].length; j++) {
				var distance2 = this.diss.compute(this.centroids[i],
					matrix[this.clusters[i][j]]);

				if (distance > distance2) {
					point = this.clusters[i][j];
					distance = distance2;
				}
			}

			m[i] = point;
		}

		return m;
	}
}



class ClusteringMedoidSampler extends Sampler {
	constructor() {
		super();
	}

	sample() {
		var matrix = RMtoAM(this.input);

		var sampledata = null;
		var bkmeans = new BKMeans(this.sampleSize);
		bkmeans.execute(matrix);

		var medoids = bkmeans.getMedoids(matrix);
		sampledata = new Array();

		for (var i = 0; i < medoids.length; i++) {
			sampledata.push(matrix[medoids[i]]);
		}

		var datasample = new Array();
		for (var i = 0; i < sampledata.length; i++) {
			datasample[i] = sampledata[i].values;
		}

		return datasample;
	}
}

class DistanceMatrix {
	constructor(rmatrix, diss) {
		this.nrElements = rmatrix.length;
		this.maxDistance = Number.NEGATIVE_INFINITY;
		this.minDistance = Number.POSITIVE_INFINITY;

		var matrix = new Array();
		matrix = RMtoAM(rmatrix);

		if (diss == null) {
			diss = new Euclidean();
		}

		this.distmatrix = new Array();
		for (var i = 0; i < this.nrElements - 1; i++) {
			this.distmatrix[i] = new Array(i+1);
			for (var j = 0; j < this.distmatrix[i].length; j++) {
				var distance = diss.compute(matrix[i+1], matrix[j]);
				this.setDistance(i+1, j, distance);
			}
		}
	}

	setDistance(indexA, indexB, value) {
		if (indexA != indexB) {
			if (indexA < indexB) {
				this.distmatrix[indexB-1][indexA] = value;
			} else {
				this.distmatrix[indexA-1][indexB] = value;
			}

			if (this.minDistance > value && value >= 0.0) {
				this.minDistance = value;
			} else {
				if (this.maxDistance < value && value >= 0.0) {
					this.maxDistance = value;
				}
			}
		}
	}

	getDistance(indexA, indexB) {
		if (indexA == indexB) {
			return 0.0;
		} else {
			if (indexA < indexB) {
				return this.distmatrix[indexB-1][indexA];
			}
			else {
				return this.distmatrix[indexA-1][indexB];
			}
		}
	}
}

// Constrói uma matiz[][] a partir do conteúdo de um ficheiro ou uma matriz[][] vazia
function constroiMatriz(contents, numLinhas, numDimensoes) {
	if (contents == null) {
		var matrix = new Array(numLinhas);
		for (var i = 0; i < numLinhas; i++)
			matrix[i] = new Array(numDimensoes);

	} else {
		var matrix = {
			ids: [],
			labels: [],
			numLinhas: parseInt(contents[1]),
			numDimensoes: parseInt(contents[2])
		};

		var dados = new Array(matrix.numLinhas);

		for (var i = 0; i < matrix.numLinhas; i++) {
			dados[i] = new Array(matrix.numDimensoes);
		}

		for (var i = 0; i < matrix.numLinhas; i++) {
			var linha = contents[i+4].split(";");
			matrix.ids[i] = parseInt(linha[0]);
			for (var j = 0; j < matrix.numDimensoes; j++) {
				dados[i][j] = parseFloat(linha[j+1]);
			}
			matrix.labels[i] = linha[j+1];
		}

		matrix.data = dados;
	}

	
	return matrix;
}

function RMtoAM (rm) {
	var v = new Array();
	for (var i = 0; i < rm.length; i++)
		v.push(new DenseVector(rm[i]));

	return v;
}

class LampVis extends Projection {
	constructor(dimension) {
		super(dimension);
		this.epsilon = 1.0000000116860974e-7;
		this.sampledata = null;
		this.sampleproj = null;
		this.sampler = null;
		this.fracdelta = 8.0;
		this.nriteractions = 100;
		this.samplesize = 0;
	}

	getFractionDelta() {
		return this.fracdelta;
	}

	setFractionDelta(fracdelta) {
		this.fracdelta = fracdelta;
	}

	getNumberIteractions() {
		return this.nriteractions;
	}

	setNumberIteractions(nriteractions) {
		this.nriteractions = nriteractions;
	}

	getSampleSize() {
		return this.samplesize;
	}

	setSampleSize(samplesize) {
		this.samplesize = samplesize;
	}

	getSampleData(matrix, samplesize) {
		var s = new Sampler();
		s = this.sampler

		if (s == null) {
			s = new ClusteringMedoidSampler();
		}
		
		s.setInput(matrix);
		s.setSampleSize(samplesize);
		s.execute();
		var sampledata_aux = s.getOutput();

		return sampledata_aux;
	}

	project() {
		var data = this.input.data;
		
		if (this.sampledata == null) {
			if (this.samplesize == 0) {
				this.samplesize = parseInt(Math.sqrt(this.length));
			}

			var sampledata_aux = this.getSampleData(data, this.samplesize);
			var idmap = new IDMAP(2);
			idmap.setInput(sampledata_aux);
			idmap.setFractionDelta(this.fracdelta);
			idmap.setInitialization("FASTMAP");
			idmap.setNumberIteractions(this.nriteractions);
			var sampleproj_aux = idmap.project();

			this.sampledata = sampledata_aux;
			this.sampleproj = sampleproj_aux;
		}

		else if (sampleproj == null) {
			var sampledata_aux = this.sampledata;
			var idmap = new IDMAP(2);
			idmap.setInput(sampledata_aux);
			idmap.setFractionDelta(this.fracdelta);
			idmap.setInitialization("FASTMAP");
			idmap.setNumberIteractions(this.nriteractions);

			this.sampleproj = idmap.project();
			this.samplesize = sampleproj.length;	// getRowDimension()
		}

		else {
			samplesize = sampleproj.length;		// getRowDimension()
		}

		var proj_aux = constroiMatriz(null, data.length, 2);
		this.createTransformation(proj_aux, data, 0, data.length - 1);

		console.log("Lamp proj...");

		return proj_aux;
	}

	createTransformation(projection, matrix, begin, end) {
		// Dimensões
		var d = matrix[0].length;
		var k = this.sampledata.length;
		var r = this.sampleproj[0].length;

		// Escalares
		var Wsum, aij;
		var v00, v10, v01, v11;
		var uj0, uj1, x, y, diff;

		// Arrays 1d
		var X, W, Wsqrt;
		var P, Psum, Pstar;
		var Q, Qsum, Qstar;

		Pstar = new Array();
		Qstar = new Array();

		var AtB = constroiMatriz(null, d, r);

		// Cálculos
		var p, i, j;
		for (p = begin; p <= end; p++) {
			X = matrix[p];

			// Passo 1: Obter W, Pstar e Qstar
			W = new Array(k);
			Wsqrt = new Array(k);
			Psum = new Array(d);
			Qsum = new Array(r);
			Wsum = 0;
			var jump = false;

			W.fill(0.0);
			Wsqrt.fill(0.0);
			Psum.fill(0.0);
			Qsum.fill(0.0);

			for (i = 0; i < k; i++) {
				P = this.sampledata[i];
				Q = this.sampleproj[i];

				W[i] = 0;
				for (j = 0; j < d; j++) {
					W[i] += (X[j] - P[j]) * (X[j] - P[j]);
				}

				// Pontos coincidentes
				if (W[i] < this.epsilon) {
					projection[p][0] = Q[0];
					projection[p][1] = Q[1];
					jump = true;
					break;
				}

				W[i] = 1 / W[i];
				for (j = 0; j < d; j++) {
					Psum[j] = Psum[j] + P[j] * W[i];
				}

				Qsum[0] = Qsum[0] + Q[0] * W[i];
                Qsum[1] = Qsum[1] + Q[1] * W[i];

                Wsum = Wsum + W[i];
                Wsqrt[i] = parseFloat(Math.sqrt(W[i]));
			}

			if (jump) {
				continue;
			}

			for (var j = 0; j < d; j++) {
				Pstar[j] = Psum[j] / Wsum;
			}

			Qstar[0] = Qsum[0] / Wsum;
			Qstar[1] = Qsum[1] / Wsum;

			// Passo 2: Obter Phat, Qhat, A e B
			// Calculando AtB
			for (i = 0; i < d; i++) {
				x = 0;
				y = 0;

				for (j = 0; j < k; j++) {
					P = this.sampledata[j];
					Q = this.sampleproj[j];

					aij = (P[i] - Pstar[i]) * Wsqrt[j];

					x = x + (aij * ((Q[0] - Qstar[0]) * Wsqrt[j]));
                    y = y + (aij * ((Q[1] - Qstar[1]) * Wsqrt[j]));
				}

				AtB[i][0] = x;
				AtB[i][1] = y;
			}

			// Passo 3: Projeção

			// Computação SVD
			var svdcalc = numeric.svd(AtB);
			var V = svdcalc.V;
			var U = svdcalc.U;

			// O sinal está invertido na primeira coluna
			for (var i = 0; i < V.length; i++) {
				V[i][0] *= -1;
			}
			for (var i = 0; i < U.length; i++) {
				U[i][0] *= -1;
			}

			v00 = V[0][0];
			v01 = V[0][1];
			v10 = V[1][0];
			v11 = V[1][1];

			x = 0;
			y = 0;
			for (j = 0; j < d; j++) {
				diff = (X[j] - Pstar[j]);
                uj0 = U[j][0];
                uj1 = U[j][1];

                x += diff * (uj0 * v00 + uj1 * v01);
                y += diff * (uj0 * v10 + uj1 * v11);
            }

            x = x + Qstar[0];
            y = y + Qstar[1];

            // Adiciona ponto à projeção
            projection[p][0] = x;
            projection[p][1] = y;
		}
	}
}

class IDMAP extends Projection {
	constructor(dimension) {
		super(dimension);
		this.fracdelta = 8.0;
		this.nriteractions = 50;
		this.ini = "FASTMAP";
	}

	project() {
		var projection = null;
		var diss = new Euclidean();
		var dmat = new DistanceMatrix(this.input, diss);
		this.dmat = new DistanceMatrix(this.input, diss);

		if (this.ini == "FASTMAP") {
			var fastmap = new FastMap(2, new DistanceMatrix(this.input, diss));
			fastmap.setInput(this.input);
			fastmap.setDissimilarity(this.dissimilarity);
			projection = fastmap.project();

			if (projection != null) {
				var force = new ForceScheme(this.dimension, projection.length);
				var error = Number.MAX_VALUE;

				for (var i = 0; i < this.nriteractions; i++) {
					error = force.iteration(dmat, projection);
				}
			}
		}

		return projection;
	}

	setInput(input) {
		this.input = input;
	}

	getInitialization() {
		return this.ini;
	}

	setInitialization(ini) {
		this.ini = ini;
	}

	getFractionDelta() {
		return this.fracdelta;
	}

	setFractionDelta(fracdelta) {
		this.fracdelta = fracdelta;
	}

	getNumberIteractions() {
		return this.nriteractions;
	}

	setNumberIteractions(nriteractions) {
		this.nriteractions = nriteractions;
	}
}

class ForceScheme {
	constructor(dimension, numberPoints) {
		this.fractionDelta = 8.0;
		var index_aux = new Array();
		for (var i = 0; i < numberPoints; i++) {
			index_aux.push(i);
		}

		this.index = new Array();
		var ind = 0;
		for (var j = 0; j < numberPoints; j++) {
			if (ind >= index_aux.length) {
				ind = 0;
			}

			this.index[j] = index_aux[ind];
			index_aux.splice(ind, 1);

			ind += parseInt(index_aux.length / 10);
		}

		this.epsilon = 1.0000000116860974e-7;
	}

	iteration(dmat, proj) {
		var error = 0.0;
		var length = proj.length;

		for (var ins1 = 0; ins1 < length; ins1++) {
			var instance = this.index[ins1];

			for (var  ins2 = 0; ins2 < length; ins2++) {
				var instance2 = this.index[ins2];

				if (instance == instance2) {
					continue;
				}

				var x1x2 = proj[instance2][0] - proj[instance][0];
				var y1y2 = proj[instance2][1] - proj[instance][1];
				var dr2 = Math.sqrt(x1x2 * x1x2 + y1y2 * y1y2);

				if (dr2 < this.epsilon)
					dr2 = this.epsilon;

				var drn = dmat.getDistance(instance, instance2);
				var normdrn = (drn - dmat.minDistance);

				if (dmat.maxDistance > dmat.minDistance) {
					normdrn = normdrn / (dmat.maxDistance - dmat.minDistance);
				}

				var delta = normdrn - dr2;
				delta *= Math.abs(delta);
				delta /= this.fractionDelta;
				error += Math.abs(delta);

				var aux = proj[instance2][0];
				proj[instance2][0] = aux + delta * (x1x2 / dr2);
				aux = proj[instance2][1];
				proj[instance2][1] = aux + delta * (y1y2 / dr2);
			}
		}

		error /= (length * length) - length;

		return error;
	}
}

class FastMap extends Projection {
	constructor(dimension, matrix) {
		super(dimension);
		this.dmat = matrix;
	}

	setInput(input) {
		this.input = input;
	}

	project() {
		var points = constroiMatriz(null, this.dmat.nrElements, this.dimension);

		if (points.length < 4) {
			this.doTheFastmapLessThan4Points(points, this.dmat);
		} else {
			this.doTheFastmap(points, this.dmat);
		}

		this.normalize(points);

		return points;
	}

	doTheFastmapLessThan4Points(points, dmat) {
		if (points.length == 1) {
			points[0][0] = 0;
			points[0][1] = 0;
		}
		else if (points.length == 2) {
			points[0][0] = 0;
			points[0][1] = 0;
			points[1][0] = dmat.getDistance(0, 1);
			points[1][1] = 0;
		}
		else if (points.length == 3) {
			points[0][0] = 0;
			points[0][1] = 0;
			points[1][0] = dmat.getDistance(0, 1);
			points[1][1] = 0;
			points[2][0] = dmat.getDistance(0, 1);
			points[2][1] = dmat.getDistance(1, 2);
		}
	}

	doTheFastmap(points, dmat) {
		var currentDimension = 0;

		while (currentDimension < this.dimension) {
			var lvchoosen = this.chooseDistantObjects(dmat);
			var lvdistance = dmat.getDistance(lvchoosen[0], lvchoosen[1]);

			if (lvdistance == 0) {
				for (var lvi = 0; lvi < dmat.nrElements; lvi++) {
					points[lvi][currentDimension] = 0.0;
				}
			} else {
				for (var lvi = 0; lvi < dmat.nrElements; lvi++) {
					var dist1 = dmat.getDistance(lvchoosen[0], lvi);
					var dist2 = dmat.getDistance(lvchoosen[0], lvchoosen[1]);
					var dist3 = dmat.getDistance(lvi, lvchoosen[1]);

					var lvxi = (Math.pow(dist1, 2) + Math.pow(dist2, 2) - Math.pow(dist3, 2))
						/ (2 * dist2);

					points[lvi][currentDimension] = lvxi;
				}

				if (currentDimension < this.dimension - 1) {
					this.updateDistances(dmat, points, currentDimension);
				}
			}

			currentDimension++;
		}
	}

	normalize(result) {
		var lvdimensions = result[0].length;
		var lvinstances = result.length;

		var lvlowrange = new Array(lvdimensions);
		var lvhighrange = new Array(lvdimensions);

		for (var lvins = 0; lvins < lvinstances; lvins++) {
			for (var lvfield = 0; lvfield < lvdimensions; lvfield++) {
				if (lvins == 0) {
					lvlowrange[lvfield] = result[lvins][lvfield];
					lvhighrange[lvfield] = result[lvins][lvfield];
				} else {
					lvlowrange[lvfield] = lvlowrange[lvfield] > result[lvins][lvfield] ?
						result[lvins][lvfield] : lvlowrange[lvfield];
					lvhighrange[lvfield] = lvhighrange[lvfield] < result[lvins][lvfield] ?
						result[lvins][lvfield] : lvhighrange[lvfield];
				}
			}
		}

		for (var lvins = 0; lvins < lvinstances; lvins++) {
			for (var lvfield = 0; lvfield < lvdimensions; lvfield++) {
				if ((lvhighrange[lvfield] - lvlowrange[lvfield]) > 0.0) {
					var res = (result[lvins][lvfield] - lvlowrange[lvfield])
						/ (lvhighrange[lvfield] - lvlowrange[lvfield]);

					result[lvins][lvfield] = res;
				} else {
					result[lvins][lvfield] = 0;
				}
			}
		}
	}

	chooseDistantObjects(dmat) {
		var choosen = new Array(2);
		var x = 0;
		var y = 0;

		for (var i = 0; i < dmat.nrElements - 1; i++) {
			for (var j = i + 1; j < dmat.nrElements; j++) {
				if (dmat.getDistance(x, y) < dmat.getDistance(i, j)) {
					x = i;
					y = j;
				}
			}
		}

		choosen[0] = x;
		choosen[1] = y;

		return choosen;
	}

	updateDistances(dmat, points, currentDimension) {
		for (var lvinst = 0; lvinst < dmat.nrElements; lvinst++) {
			for (var lvinst2 = lvinst + 1; lvinst2 < dmat.nrElements; lvinst2++) {
				var value = (Math.sqrt(Math.abs(Math.pow(dmat.getDistance(lvinst, lvinst2), 2)
                        - Math.pow((points[lvinst][currentDimension]
                        - points[lvinst2][currentDimension]), 2))));

				dmat.setDistance(lvinst, lvinst2, value);
			}
		}
	}
}